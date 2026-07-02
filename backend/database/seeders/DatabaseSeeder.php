<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use App\Models\Faq;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::create([
            'first_name' => 'Branch',
            'last_name'  => 'Admin',
            'email'      => 'admin@bethelgen.com',
            'password'   => Hash::make('Admin@1234'),
            'role'       => 'admin',
            'is_active'  => true,
        ]);

        // Demo client
        User::create([
            'first_name' => 'Juan',
            'last_name'  => 'Dela Cruz',
            'email'      => 'client@demo.com',
            'password'   => Hash::make('Client@1234'),
            'role'       => 'client',
            'phone'      => '09171234567',
            'address'    => 'Legazpi City, Albay',
            'is_active'  => true,
        ]);

        // Insurance products
        $products = [
            [
                'name'        => 'Fire Insurance',
                'slug'        => 'fire',
                'description' => 'Protects homeowners, building owners, and tenants against fire and allied perils including earthquake, typhoon, and flood.',
                'required_documents' => json_encode([
                    'Duly accomplished claim form',
                    'Copy of insurance policy',
                    'Fire department report / Police report',
                    'Photos of damaged property',
                    'Inventory list of damaged items',
                    'Proof of ownership or lease agreement',
                ]),
                'basic_info_fields' => json_encode([
                    ['key' => 'property_type', 'label' => 'Property Type', 'type' => 'select', 'options' => ['Residential', 'Commercial', 'Industrial']],
                    ['key' => 'property_address', 'label' => 'Property Address', 'type' => 'text'],
                    ['key' => 'construction_type', 'label' => 'Construction Type', 'type' => 'select', 'options' => ['Concrete', 'Semi-Concrete', 'Wood', 'Mixed']],
                    ['key' => 'estimated_value', 'label' => 'Estimated Property Value (PHP)', 'type' => 'number'],
                    ['key' => 'year_built', 'label' => 'Year Built', 'type' => 'number'],
                ]),
            ],
            [
                'name'        => 'Motor Car Insurance',
                'slug'        => 'motor',
                'description' => 'Indemnifies the insured against loss, damage or liability arising from motor vehicle accidents including theft and third-party liability.',
                'required_documents' => json_encode([
                    'Duly accomplished claim form',
                    'Copy of insurance policy',
                    'Official Receipt (OR) and Certificate of Registration (CR)',
                    "Driver's License of driver involved",
                    'Police / Traffic report',
                    'Photos of damaged vehicle',
                    'Repair estimate from accredited shop',
                ]),
                'basic_info_fields' => json_encode([
                    ['key' => 'vehicle_make', 'label' => 'Vehicle Make', 'type' => 'text'],
                    ['key' => 'vehicle_model', 'label' => 'Vehicle Model', 'type' => 'text'],
                    ['key' => 'vehicle_year', 'label' => 'Year Model', 'type' => 'number'],
                    ['key' => 'plate_number', 'label' => 'Plate Number', 'type' => 'text'],
                    ['key' => 'chassis_number', 'label' => 'Chassis Number', 'type' => 'text'],
                    ['key' => 'market_value', 'label' => 'Current Market Value (PHP)', 'type' => 'number'],
                    ['key' => 'coverage_type', 'label' => 'Coverage Type', 'type' => 'select', 'options' => ['CTPL Only', 'Comprehensive', 'Acts of God']],
                ]),
            ],
            [
                'name'        => 'Marine Insurance',
                'slug'        => 'marine',
                'description' => 'Covers physical loss or damage on goods, property or merchandise in transit whether by sea, land, or air.',
                'required_documents' => json_encode([
                    'Duly accomplished claim form',
                    'Copy of insurance policy / certificate',
                    'Bill of lading / Airway bill',
                    'Commercial invoice and packing list',
                    'Survey report',
                    'Photos of damaged cargo',
                ]),
                'basic_info_fields' => json_encode([
                    ['key' => 'cargo_type', 'label' => 'Type of Cargo', 'type' => 'text'],
                    ['key' => 'cargo_value', 'label' => 'Cargo Value (PHP)', 'type' => 'number'],
                    ['key' => 'origin', 'label' => 'Port of Origin', 'type' => 'text'],
                    ['key' => 'destination', 'label' => 'Port of Destination', 'type' => 'text'],
                    ['key' => 'transport_mode', 'label' => 'Mode of Transport', 'type' => 'select', 'options' => ['Sea', 'Air', 'Land']],
                ]),
            ],
            [
                'name'        => 'Engineering Insurance',
                'slug'        => 'engineering',
                'description' => 'Covers construction projects, civil works, and machinery against unforeseen physical damage.',
                'required_documents' => json_encode([
                    'Duly accomplished claim form',
                    'Copy of insurance policy',
                    'Project documents / contract',
                    'Technical report on damage',
                    'Photos of damaged works/equipment',
                    'Repair or replacement cost estimate',
                ]),
                'basic_info_fields' => json_encode([
                    ['key' => 'project_name', 'label' => 'Project Name', 'type' => 'text'],
                    ['key' => 'project_location', 'label' => 'Project Location', 'type' => 'text'],
                    ['key' => 'contract_value', 'label' => 'Contract Value (PHP)', 'type' => 'number'],
                    ['key' => 'project_duration', 'label' => 'Project Duration (months)', 'type' => 'number'],
                    ['key' => 'coverage_type', 'label' => 'Coverage Type', 'type' => 'select', 'options' => ['Construction All Risks', 'Erection All Risks', 'Machinery Breakdown', 'Contractors Plant & Equipment']],
                ]),
            ],
            [
                'name'        => 'Casualty Insurance',
                'slug'        => 'casualty',
                'description' => 'Protects the insured against legal liability to third parties for bodily injury and property damage.',
                'required_documents' => json_encode([
                    'Duly accomplished claim form',
                    'Copy of insurance policy',
                    'Police or incident report',
                    'Medical certificates / hospital bills (if bodily injury)',
                    'Photos of incident',
                    'Demand letter from claimant (if any)',
                ]),
                'basic_info_fields' => json_encode([
                    ['key' => 'business_nature', 'label' => 'Nature of Business / Activity', 'type' => 'text'],
                    ['key' => 'business_location', 'label' => 'Business Location', 'type' => 'text'],
                    ['key' => 'coverage_limit', 'label' => 'Desired Coverage Limit (PHP)', 'type' => 'number'],
                    ['key' => 'num_employees', 'label' => 'Number of Employees', 'type' => 'number'],
                ]),
            ],
            [
                'name'        => 'Bonds',
                'slug'        => 'bonds',
                'description' => 'Surety bonds for contractors, supply and delivery, and other obligations guaranteeing faithful performance.',
                'required_documents' => json_encode([
                    'Duly accomplished application form',
                    'Copy of contract / agreement',
                    'Financial statements (latest 3 years)',
                    'ITR (Income Tax Return)',
                    'Business permits and licenses',
                    'List of completed and ongoing projects',
                ]),
                'basic_info_fields' => json_encode([
                    ['key' => 'bond_type', 'label' => 'Type of Bond', 'type' => 'select', 'options' => ['Bid Bond', 'Performance Bond', 'Payment Bond', 'Maintenance Bond', 'Supply Bond']],
                    ['key' => 'principal_name', 'label' => 'Principal / Contractor Name', 'type' => 'text'],
                    ['key' => 'obligee', 'label' => 'Obligee (Beneficiary)', 'type' => 'text'],
                    ['key' => 'bond_amount', 'label' => 'Bond Amount (PHP)', 'type' => 'number'],
                    ['key' => 'project_description', 'label' => 'Project Description', 'type' => 'text'],
                ]),
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        // FAQ entries
        $faqs = [
            ['question' => 'What is non-life insurance?', 'answer' => 'Non-life insurance covers financial losses arising from specific events or accidents — such as fire, vehicular accidents, theft, and natural disasters — for a defined period (usually one year). Unlike life insurance, it does not involve a life benefit.'],
            ['question' => 'How do I get a quote?', 'answer' => 'You can get an initial quote by clicking the "Get a Quote" button on our landing page, filling out your basic information and property details. Our branch staff will then reach out to finalize your premium computation.'],
            ['question' => 'What documents do I need to submit for a policy application?', 'answer' => 'Required documents vary per product. Once you start your application in the portal, the system will show you the specific list of documents needed. You can upload them directly here.'],
            ['question' => 'How long does the policy processing take?', 'answer' => 'Processing typically takes 3-5 business days after complete document submission. You will receive real-time notifications on your application status through this portal.'],
            ['question' => 'How do I file a claim?', 'answer' => 'Go to the Application tab, click "New Application," and select "Claim." Fill out the claim details and upload the required documents. Our branch will review and contact you within 2-3 business days.'],
            ['question' => 'What is CTPL?', 'answer' => 'Compulsory Third Party Liability (CTPL) is a mandatory insurance for all motor vehicles registered in the Philippines. It covers bodily injury or death to third parties caused by the insured vehicle.'],
            ['question' => 'Can I renew my policy through this portal?', 'answer' => 'Yes. When your policy is nearing expiration, the system will notify you and you can initiate renewal directly through your portal by starting a new application for the same product.'],
            ['question' => 'What file formats are accepted for document uploads?', 'answer' => 'We accept PDF, JPG, JPEG, and PNG files. Each file should not exceed 10MB. Make sure documents are clear and all text is legible before uploading.'],
            ['question' => 'Who can I contact for urgent concerns?', 'answer' => 'You can send us a message directly through the messaging feature in this portal. For urgent matters, you may also call our Legazpi Branch at (+63)927-290-4397 or email us at damanzanillojr@bethelgen.com.'],
            ['question' => 'Is my personal information safe?', 'answer' => 'Yes. All your personal information and uploaded documents are encrypted and stored securely. We comply with the Data Privacy Act of 2012 (RA 10173) and our privacy policy. Your data will never be shared with third parties without your consent.'],
        ];

        foreach ($faqs as $faq) {
            Faq::create(array_merge($faq, ['is_active' => true]));
        }
    }
}
