<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LandingSetting extends Model
{
    use HasUuids;

    public const SINGLETON_ID = '00000000-0000-4000-8000-000000000001';

    protected $fillable = [
        'id',
        'content',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function defaultContent(): array
    {
        return [
            'brandName' => 'Vellum Academy',
            'heroEyebrow' => 'Vellum Academy',
            'heroHeadline' => 'Choose your coffee course',
            'heroSubtext' => 'Immerse yourself in sensory barista training — from first pour to certified craft, guided in the Vellum school console.',
            'discountBadge' => '40% Discount',
            'aboutTitle' => 'The story of Vellum Academy',
            'aboutSubtitle' => 'About Vellum Academy',
            'aboutBody' => "Vellum was built for barista schools that run on rhythm — batches, practical exams, milk pitchers, and certificates that must hold up under scrutiny.\n\nWe replace scattered spreadsheets with one console for admissions, timetable, attendance, exams, certificates, and placement — so trainers teach while ops stay visible.\n\nFrom first application to a verified PDF certificate, every student path stays connected. That is the Vellum standard.",
            'aboutImage1' => '/landing/landing-about-tamp.png',
            'aboutImage2' => '/landing/landing-about-brew.png',
            'eventsTitle' => "Big or small, let's coffee trip!",
            'eventsSubtitle' => 'Roasting Events',
            'eventsBody' => 'Host roasting demos, cupping nights, and guest trainer sessions — schedule them in Vellum and keep enrollment tied to the same student records.',
            'coursesSectionEyebrow' => 'Webinar and our featured courses',
            'coursesSectionTitle' => 'Our featured online courses',
            'contactTitle' => 'We look forward to hearing from you!',
            'contactSubtext' => 'Ask about courses, school onboarding, or a Vellum demo for your academy.',
            'footerBlurb' => 'The operating desk for barista academies — admissions, training, exams, and certificates.',
            'miniCourses' => [
                [
                    'id' => 'mini-1',
                    'label' => 'Normal Course',
                    'days' => '3 Days',
                    'price' => 'NPR 5,999',
                    'was' => 'NPR 11,499',
                    'blurb' => 'Espresso basics, milk texture, and first service floor skills.',
                ],
                [
                    'id' => 'mini-2',
                    'label' => 'Super Course',
                    'days' => '7 Days',
                    'price' => 'NPR 12,999',
                    'was' => 'NPR 19,999',
                    'blurb' => 'Latte art, brew methods, roasting intro, and exam practice.',
                ],
            ],
            'testimonials' => [
                [
                    'id' => 't1',
                    'quote' => 'Vellum kept our batches, attendance, and certificates in one place. Ops finally feel calm.',
                    'name' => 'Amina Okoro',
                    'role' => 'Academy Director',
                    'company' => 'Siemens',
                ],
                [
                    'id' => 't2',
                    'quote' => 'Exams and practical grades sync to student records without spreadsheet chaos.',
                    'name' => 'Liam Hartmann',
                    'role' => 'Head Trainer',
                    'company' => 'Bose',
                ],
                [
                    'id' => 't3',
                    'quote' => 'Placement tracking after certification helped us show real outcomes to partners.',
                    'name' => 'Priya Nair',
                    'role' => 'Operations Lead',
                    'company' => 'Fujitsu',
                ],
            ],
            'featuredCourseIds' => [],
            'courseMeta' => [],
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate(
            ['id' => static::SINGLETON_ID],
            ['content' => static::defaultContent()]
        );
    }
}
