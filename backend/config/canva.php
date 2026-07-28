<?php

return [
    'client_id' => env('CANVA_CLIENT_ID'),
    'client_secret' => env('CANVA_CLIENT_SECRET'),
    'redirect_uri' => env('CANVA_REDIRECT_URI', env('APP_URL').'/api/canva/callback'),
    'frontend_redirect' => env('CANVA_FRONTEND_REDIRECT', 'http://127.0.0.1:3000/dashboard/certificates'),

    'auth_url' => 'https://www.canva.com/api/oauth/authorize',
    'token_url' => 'https://api.canva.com/rest/v1/oauth/token',
    'api_base' => 'https://api.canva.com/rest/v1',

    'scopes' => [
        'app:read',
        'app:write',
        'asset:read',
        'asset:write',
        'brandtemplate:content:read',
        'brandtemplate:content:write',
        'brandtemplate:meta:read',
        'comment:read',
        'comment:write',
        'design:content:read',
        'design:content:write',
        'design:meta:read',
        'design:meta:write',
        'design:permission:read',
        'design:permission:write',
        'folder:read',
        'folder:write',
        'folder:permission:read',
        'folder:permission:write',
        'profile:read',
    ],

    // Brand template IDs from Canva Enterprise Brand Kit
    'templates' => [
        'id_card' => env('CANVA_ID_CARD_TEMPLATE_ID'),
        'certificate' => env('CANVA_CERTIFICATE_TEMPLATE_ID'),
    ],

    /*
    | Autofill field names must match the data fields on your Brand Templates.
    | Rename these in .env after you inspect the template dataset in Canva.
    */
    'fields' => [
        'student_name' => env('CANVA_FIELD_STUDENT_NAME', 'student_name'),
        'student_code' => env('CANVA_FIELD_STUDENT_CODE', 'student_code'),
        'course' => env('CANVA_FIELD_COURSE', 'course'),
        'batch' => env('CANVA_FIELD_BATCH', 'batch'),
        'blood_group' => env('CANVA_FIELD_BLOOD_GROUP', 'blood_group'),
        'issued_at' => env('CANVA_FIELD_ISSUED_AT', 'issued_at'),
        'certificate_number' => env('CANVA_FIELD_CERT_NUMBER', 'certificate_number'),
        'school_name' => env('CANVA_FIELD_SCHOOL_NAME', 'school_name'),
    ],

    'school_name' => env('CANVA_SCHOOL_NAME', 'Vellum LMS'),
    'export_format' => env('CANVA_EXPORT_FORMAT', 'pdf'),
];
