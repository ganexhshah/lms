<?php

namespace App\Services\Canva;

use App\Models\CanvaDesign;
use App\Models\Student;
use App\Models\User;
use App\Services\CdnStorage;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class CanvaDesignService
{
    public function __construct(
        private CanvaClient $canva,
        private CdnStorage $cdn,
    ) {}

    public function generateIdCard(User $user, Student $student): CanvaDesign
    {
        $templateId = config('canva.templates.id_card');
        if (! $templateId) {
            throw new RuntimeException('Set CANVA_ID_CARD_TEMPLATE_ID in .env (Brand Template ID).');
        }

        $fields = config('canva.fields');
        $data = $this->textFields([
            $fields['student_name'] => trim($student->first_name.' '.$student->last_name),
            $fields['student_code'] => $student->student_code,
            $fields['course'] => $student->course,
            $fields['batch'] => $student->batch,
            $fields['blood_group'] => $student->blood_group ?? '',
            $fields['issued_at'] => now()->toDateString(),
            $fields['school_name'] => config('canva.school_name'),
        ]);

        return $this->autofillAndExport(
            user: $user,
            type: 'id_card',
            templateId: $templateId,
            data: $data,
            student: $student,
            subjectKey: $student->student_code,
            title: "ID Card — {$student->student_code}",
            folder: 'canva/id-cards',
        );
    }

    /**
     * @param  array<string, string|null>  $overrides
     */
    public function generateCertificate(
        User $user,
        Student $student,
        array $overrides,
    ): CanvaDesign {
        $templateId = config('canva.templates.certificate');
        if (! $templateId) {
            throw new RuntimeException('Set CANVA_CERTIFICATE_TEMPLATE_ID in .env (Brand Template ID).');
        }

        $resolved = [
            'student_name' => trim((string) ($overrides['studentName'] ?: $student->first_name.' '.$student->last_name)),
            'student_code' => $student->student_code,
            'course' => (string) ($overrides['course'] ?: $student->course),
            'batch' => (string) ($overrides['batch'] ?: $student->batch),
            'certificate_number' => (string) ($overrides['certificateNumber']
                ?: ('CERT-'.now()->format('Y').'-'.strtoupper(substr(uniqid(), -6)))),
            'issued_at' => (string) ($overrides['issuedAt'] ?: now()->toDateString()),
            'school_name' => (string) ($overrides['schoolName'] ?: config('canva.school_name')),
        ];

        $fields = config('canva.fields');
        $data = $this->textFields([
            $fields['student_name'] => $resolved['student_name'],
            $fields['student_code'] => $resolved['student_code'],
            $fields['course'] => $resolved['course'],
            $fields['batch'] => $resolved['batch'],
            $fields['certificate_number'] => $resolved['certificate_number'],
            $fields['issued_at'] => $resolved['issued_at'],
            $fields['school_name'] => $resolved['school_name'],
        ]);

        return $this->autofillAndExport(
            user: $user,
            type: 'certificate',
            templateId: $templateId,
            data: $data,
            student: $student,
            subjectKey: $resolved['certificate_number'],
            title: "Certificate — {$resolved['certificate_number']}",
            folder: 'canva/certificates',
            meta: $resolved,
        );
    }

    /**
     * @param  array<string, string>  $map
     * @return array<string, array{type: string, text: string}>
     */
    private function textFields(array $map): array
    {
        $out = [];
        foreach ($map as $key => $value) {
            if (! $key) {
                continue;
            }
            $out[$key] = [
                'type' => 'text',
                'text' => (string) $value,
            ];
        }

        return $out;
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $meta
     */
    private function autofillAndExport(
        User $user,
        string $type,
        string $templateId,
        array $data,
        Student $student,
        string $subjectKey,
        string $title,
        string $folder,
        array $meta = [],
    ): CanvaDesign {
        $create = $this->canva->request($user, 'POST', 'autofills', [
            'brand_template_id' => $templateId,
            'title' => $title,
            'data' => $data,
        ]);

        $jobId = data_get($create, 'job.id');
        if (! $jobId) {
            throw new RuntimeException('Canva autofill did not return a job id.');
        }

        $done = $this->canva->pollJob($user, "autofills/{$jobId}");
        $designId = data_get($done, 'job.result.design.id');
        $editUrl = data_get($done, 'job.result.design.urls.edit_url')
            ?? data_get($done, 'job.result.design.url');
        $viewUrl = data_get($done, 'job.result.design.urls.view_url');

        if (! $designId) {
            throw new RuntimeException('Canva autofill succeeded but no design id was returned.');
        }

        $exportUrl = $this->exportDesign($user, $designId);
        $cdnUrl = $this->mirrorToCdn($exportUrl, $folder, $subjectKey);

        return CanvaDesign::create([
            'user_id' => $user->id,
            'type' => $type,
            'student_id' => $student->id,
            'subject_key' => $subjectKey,
            'canva_design_id' => $designId,
            'edit_url' => $editUrl,
            'view_url' => $viewUrl,
            'export_url' => $exportUrl,
            'cdn_url' => $cdnUrl,
            'status' => 'exported',
            'meta' => $meta,
        ]);
    }

    private function exportDesign(User $user, string $designId): string
    {
        $format = config('canva.export_format', 'pdf');
        $create = $this->canva->request($user, 'POST', 'exports', [
            'design_id' => $designId,
            'format' => [
                'type' => $format,
            ],
        ]);

        $jobId = data_get($create, 'job.id');
        if (! $jobId) {
            throw new RuntimeException('Canva export did not return a job id.');
        }

        $done = $this->canva->pollJob($user, "exports/{$jobId}");
        $urls = data_get($done, 'job.urls', []);
        $url = is_array($urls) ? ($urls[0] ?? null) : null;

        if (! $url) {
            throw new RuntimeException('Canva export finished without a download URL.');
        }

        return $url;
    }

    private function mirrorToCdn(string $exportUrl, string $folder, string $subjectKey): ?string
    {
        try {
            $response = Http::timeout(60)->get($exportUrl);
            if (! $response->successful()) {
                return null;
            }

            $ext = config('canva.export_format', 'pdf') === 'png' ? 'png' : 'pdf';
            $path = trim($folder, '/').'/'.preg_replace('/[^a-zA-Z0-9_-]/', '-', $subjectKey).'-'.now()->format('YmdHis').'.'.$ext;

            $disk = $this->cdn->disk();
            \Illuminate\Support\Facades\Storage::disk($disk)->put($path, $response->body(), [
                'visibility' => 'public',
                'ContentType' => $ext === 'png' ? 'image/png' : 'application/pdf',
                'CacheControl' => 'public, max-age=31536000',
            ]);

            return $this->cdn->url($path);
        } catch (\Throwable) {
            return null;
        }
    }
}
