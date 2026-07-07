<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\City;
use App\Models\ClientProfile;
use App\Models\ConnectTransaction;
use App\Models\Conversation;
use App\Models\FreelancerProfile;
use App\Models\Internship;
use App\Models\JobPost;
use App\Models\Proposal;
use App\Models\Service;
use App\Models\Skill;
use App\Models\User;
use App\Services\ConnectService;
use App\Services\NotificationService;
use App\Services\OrderService;
use App\Services\PaymentService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Demo dataset mirroring the mock data used by the web and mobile frontends,
 * created through the real domain services so wallets, escrow, connects and
 * order timelines stay consistent.
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $connects = app(ConnectService::class);
        $orders = app(OrderService::class);
        $payments = app(PaymentService::class);

        $city = fn (string $name) => City::query()->where('name', $name)->firstOrFail()->id;
        $skillIds = fn (array $names) => Skill::query()->whereIn('name', $names)->pluck('id')->all();

        /*
        |------------------------------------------------------------------
        | Admins
        |------------------------------------------------------------------
        */
        $admin = $this->user('FIT Admin', 'admin@fit.cm', '237699000001', User::ROLE_SUPER_ADMIN, $city('Douala'));
        $this->user('FIT Support', 'support@fit.cm', '237699000002', User::ROLE_ADMIN, $city('Douala'));

        /*
        |------------------------------------------------------------------
        | Freelancers (from the frontend mock data)
        |------------------------------------------------------------------
        */
        $freelancers = [
            'diane' => ['Diane Ngono', 'diane@fit.cm', '237677000001', 'Douala', 'Senior React & TypeScript Developer', 'expert', 21000, 97, 4.97, true, true, ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'], '5+ years building scalable web applications for African startups and international clients. Specializing in financial technology and e-commerce.'],
            'kwame' => ['Kwame Asante', 'kwame@fit.cm', '233240000002', 'Accra', 'UI/UX Designer & Brand Strategist', 'expert', 17000, 94, 4.95, true, true, ['Figma', 'Adobe XD', 'Brand Identity', 'Motion Design', 'Webflow'], 'Award-winning designer crafting digital experiences for pan-African brands. I blend modern design with local cultural context.'],
            'amina' => ['Amina Hassan', 'amina@fit.cm', '254720000003', 'Nairobi', 'Full-Stack Python & Django Developer', 'expert', 18000, 91, 4.92, false, false, ['Python', 'Django', 'PostgreSQL', 'Docker', 'Vue.js'], 'Backend specialist with deep expertise in fintech and healthcare data systems.'],
            'jeanpierre' => ['Jean-Pierre Mvondo', 'jeanpierre@fit.cm', '237677000004', 'Yaoundé', 'Mobile Developer & Flutter Expert', 'expert', 15000, 96, 4.94, true, true, ['Flutter', 'React Native', 'Firebase', 'Swift', 'Kotlin'], 'Cross-platform mobile specialist delivering pixel-perfect apps for African and global markets. 4 apps with 100k+ downloads.'],
            'fatima' => ['Fatima Diallo', 'fatima@fit.cm', '221770000005', 'Dakar', 'Content Strategist & SEO Copywriter', 'intermediate', 11000, 89, 4.88, true, false, ['SEO', 'Content Strategy', 'Copywriting', 'French', 'WordPress'], 'Trilingual content creator (French/English/Wolof) crafting compelling narratives for African businesses going global.'],
            'chuk' => ['Chukwuemeka Obi', 'chuk@fit.cm', '234800000006', 'Lagos', 'Data Analyst & Business Intelligence', 'expert', 19000, 93, 4.91, true, false, ['Python', 'Tableau', 'Power BI', 'SQL', 'Machine Learning'], 'Transforming raw data into actionable insights for FMCG, fintech, and agritech companies across sub-Saharan Africa.'],
        ];

        $freelancerUsers = [];

        foreach ($freelancers as $key => [$name, $email, $phone, $cityName, $title, $level, $rate, $jss, $rating, $available, $topRated, $skills, $bio]) {
            $user = $this->user($name, $email, $phone, User::ROLE_FREELANCER, $city($cityName));

            $profile = FreelancerProfile::query()->updateOrCreate(['user_id' => $user->id], [
                'title' => $title,
                'bio' => $bio,
                'experience_level' => $level,
                'hourly_rate' => $rate,
                'min_price' => $rate,
                'availability' => $available ? 'available' : 'busy',
                'job_success_score' => $jss,
                'rating' => $rating,
                'is_verified' => true,
                'is_top_rated' => $topRated,
            ]);

            $profile->skills()->sync($skillIds($skills));
            $profile->recalculateCompletion();

            if ($user->connects_balance === 0) {
                $connects->credit($user, 30, ConnectTransaction::TYPE_BONUS, null, 'Demo starter connects');
            }

            $freelancerUsers[$key] = $user;
        }

        /*
        |------------------------------------------------------------------
        | Clients (from the frontend mock data)
        |------------------------------------------------------------------
        */
        $clients = [
            'mtn' => ['MTN FinTech Lab', 'mtn@fit.cm', '237677000101', 'Douala', 'Financial technology'],
            'afrikart' => ['Afrikart Commerce', 'afrikart@fit.cm', '254720000102', 'Nairobi', 'E-commerce'],
            'techafrique' => ['TechAfrique Media', 'techafrique@fit.cm', '237677000103', 'Yaoundé', 'Media & publishing'],
            'greenfield' => ['GreenField AgriTech', 'greenfield@fit.cm', '234800000104', 'Lagos', 'Agriculture technology'],
            'cloudops' => ['CloudOps Cameroon', 'cloudops@fit.cm', '237677000105', 'Bafoussam', 'Cloud & SaaS'],
        ];

        $clientUsers = [];

        foreach ($clients as $key => [$name, $email, $phone, $cityName, $sector]) {
            $user = $this->user($name, $email, $phone, User::ROLE_CLIENT, $city($cityName));

            ClientProfile::query()->updateOrCreate(['user_id' => $user->id], [
                'type' => 'company',
                'company_name' => $name,
                'sector' => $sector,
                'payment_verified' => $key !== 'techafrique',
            ]);

            $clientUsers[$key] = $user;
        }

        /*
        |------------------------------------------------------------------
        | Jobs (the five mock jobs)
        |------------------------------------------------------------------
        */
        $jobs = [
            'fintech' => ['mtn', 'Development & IT', 'Full-Stack React / Node.js Developer for FinTech Dashboard', 'hourly', 15000, 27000, 'XAF', '3–6 months', 'expert', 'remote', 'We are building a mobile money aggregation platform for the CEMAC region. We need an experienced React developer with Node.js backend skills to build our analytics dashboard with real-time transaction tracking.', ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST API']],
            'brand' => ['afrikart', 'Design & Creative', 'Brand Identity & Logo Design for Pan-African E-Commerce Startup', 'fixed', 510000, 510000, 'XAF', '1–2 weeks', 'intermediate', 'remote', 'Looking for a talented designer to create a compelling brand identity for our cross-border e-commerce platform targeting 5 African markets. Must deliver logo, color system, and brand guidelines.', ['Logo Design', 'Brand Identity', 'Adobe Illustrator', 'Figma']],
            'writer' => ['techafrique', 'Digital Marketing', 'Bilingual Content Writer — French & English Tech Articles', 'fixed', 150000, 150000, 'XAF', 'Ongoing', 'intermediate', 'remote', 'We publish a weekly newsletter on African tech startups and need a bilingual writer producing in-depth articles in both French and English. SEO and audience-first writing a must.', ['Content Writing', 'French', 'English', 'Tech Journalism', 'SEO']],
            'flutter' => ['greenfield', 'Development & IT', 'Flutter Developer — Cross-Platform AgriTech Mobile App', 'hourly', 12000, 21000, 'XAF', '4–6 months', 'expert', 'remote', 'Building a crop monitoring and market price app for smallholder farmers across West Africa. Offline-first architecture is a critical requirement — users often work in low-connectivity rural environments.', ['Flutter', 'Dart', 'Firebase', 'REST API']],
            'va' => ['cloudops', 'Business & Administration', 'Virtual Assistant — Customer Support for SaaS Platform', 'hourly', 3000, 6000, 'XAF', 'Long-term', 'entry', 'remote', 'Seeking a detail-oriented VA to handle customer support tickets, onboarding emails, and basic administrative tasks for our growing B2B SaaS platform. Must be fluent in French and English.', ['Customer Support', 'Zendesk', 'Email Management', 'French', 'Excel']],
        ];

        $jobModels = [];

        foreach ($jobs as $key => [$clientKey, $categoryName, $title, $budgetType, $min, $max, $currency, $duration, $level, $mode, $description, $skills]) {
            $jobModels[$key] = JobPost::query()->firstOrCreate(
                ['title' => $title],
                [
                    'client_id' => $clientUsers[$clientKey]->id,
                    'category_id' => Category::query()->where('name_en', $categoryName)->firstOrFail()->id,
                    'slug' => Str::slug($title).'-'.Str::lower(Str::random(4)),
                    'description' => $description,
                    'budget_type' => $budgetType,
                    'budget_min' => $min,
                    'budget_max' => $max,
                    'currency' => $currency,
                    'duration' => $duration,
                    'experience_level' => $level,
                    'mode' => $mode,
                    'status' => JobPost::STATUS_OPEN,
                    'connects_cost' => 6,
                    'published_at' => now()->subDays(random_int(0, 3)),
                ],
            );

            $jobModels[$key]->skills()->sync($skillIds($skills));
            $clientUsers[$clientKey]->clientProfile?->update(['jobs_posted_count' => JobPost::query()->where('client_id', $clientUsers[$clientKey]->id)->count()]);
        }

        $this->seedServices($freelancerUsers, $skillIds);

        if (Proposal::query()->exists()) {
            $this->seedInternships();

            return; // Demo flows already ran (idempotent re-seed).
        }

        /*
        |------------------------------------------------------------------
        | Proposals
        |------------------------------------------------------------------
        */
        $proposalFor = function (string $jobKey, string $freelancerKey, float $amount, int $days, string $letter, array $milestones = []) use ($jobModels, $freelancerUsers, $connects) {
            $job = $jobModels[$jobKey];
            $freelancer = $freelancerUsers[$freelancerKey];

            $proposal = Proposal::query()->create([
                'job_post_id' => $job->id,
                'freelancer_id' => $freelancer->id,
                'amount' => $amount,
                'currency' => $job->currency,
                'delivery_days' => $days,
                'cover_letter' => $letter,
                'connects_spent' => $job->connects_cost,
            ]);

            foreach ($milestones as $index => [$title, $milestoneAmount, $dueLabel]) {
                $proposal->milestones()->create([
                    'title' => $title,
                    'amount' => $milestoneAmount,
                    'due_label' => $dueLabel,
                    'sort_order' => $index,
                ]);
            }

            $connects->spend($freelancer, $job->connects_cost, $proposal, "Proposal for \"{$job->title}\"");
            $job->increment('proposals_count');

            return $proposal;
        };

        // Contract 1 (mock): FinTech Dashboard — Diane, 2,700,000 XAF, 4 milestones.
        $dianeProposal = $proposalFor('fintech', 'diane', 2700000, 60,
            'I have delivered three fintech dashboards for CEMAC clients, including real-time Mobile Money reconciliation. I propose a milestone plan covering design, frontend, API integration and deployment.',
            [
                ['UI/UX Mockups & Design System', 480000, '2 weeks'],
                ['Frontend Dashboard — Phase 1', 720000, '5 weeks'],
                ['Backend API Integration', 900000, '7 weeks'],
                ['Testing & Deployment', 600000, '9 weeks'],
            ],
        );

        // Contract 2 (mock): Brand identity — Kwame, 510,000 XAF, 2 milestones.
        $kwameProposal = $proposalFor('brand', 'kwame', 510000, 14,
            'Your cross-border positioning needs a system, not just a logo. I will explore three creative directions before finalizing the full brand book.',
            [
                ['Initial Concepts (3 directions)', 150000, '1 week'],
                ['Final Design Package & Brand Book', 360000, '2 weeks'],
            ],
        );

        // Open proposals still pending on other jobs.
        $proposalFor('flutter', 'jeanpierre', 1500000, 90, 'I built two offline-first Flutter apps using Hive local storage with background sync — ~95% data integrity on spotty 2G connections. Happy to walk you through them.');
        $proposalFor('writer', 'fatima', 150000, 30, 'Bilingual tech writing is my specialty; I currently produce weekly French/English newsletters for two pan-African media brands.');

        /*
        |------------------------------------------------------------------
        | Contract 1 lifecycle: accepted → m1 approved, m2 in review, m3 funded
        |------------------------------------------------------------------
        */
        $orderFintech = $orders->createFromProposal($dianeProposal);
        [$m1, $m2, $m3] = $orderFintech->milestones()->orderBy('sort_order')->take(3)->get();

        $fund = function ($milestone) use ($payments, $orderFintech) {
            $payment = $payments->initiateMilestonePayment($milestone->fresh(), $orderFintech->client, 'mtn_momo', '237677000101');

            return $payments->confirm($payment, 'DEMO-'.strtoupper(Str::random(8)));
        };

        $fund($m1);
        $delivery1 = $orders->submitDelivery($orderFintech->fresh(), [
            'message' => 'Design system and dashboard mockups are ready in Figma — link attached.',
            'link_url' => 'https://figma.com/file/fit-fintech-dashboard',
            'order_milestone_id' => $m1->id,
        ]);
        $orders->approveDelivery($delivery1);

        $fund($m2);
        $orders->submitDelivery($orderFintech->fresh(), [
            'message' => 'Phase 1 of the frontend dashboard is deployed to staging for your review.',
            'link_url' => 'https://staging.fit-fintech.example',
            'order_milestone_id' => $m2->id,
        ]);

        $fund($m3);

        /*
        |------------------------------------------------------------------
        | Contract 2 lifecycle: fully delivered, approved and reviewed
        |------------------------------------------------------------------
        */
        $orderBrand = $orders->createFromProposal($kwameProposal);

        foreach ($orderBrand->milestones()->orderBy('sort_order')->get() as $milestone) {
            $payment = $payments->initiateMilestonePayment($milestone, $orderBrand->client, 'orange_money', '254720000102');
            $payments->confirm($payment, 'DEMO-'.strtoupper(Str::random(8)));

            $delivery = $orders->submitDelivery($orderBrand->fresh(), [
                'message' => "Delivery for \"{$milestone->title}\" attached.",
                'link_url' => 'https://drive.example/afrikart-brand',
                'order_milestone_id' => $milestone->id,
            ]);
            $orders->approveDelivery($delivery);
        }

        $orderBrand->refresh();
        $orderBrand->reviews()->create([
            'reviewer_id' => $orderBrand->client_id,
            'reviewee_id' => $orderBrand->freelancer_id,
            'rating' => 5,
            'rating_quality' => 5,
            'rating_communication' => 5,
            'rating_deadline' => 5,
            'rating_professionalism' => 5,
            'comment' => 'Kwame delivered a world-class brand identity ahead of schedule. Communication was flawless.',
        ]);
        $orderBrand->reviews()->create([
            'reviewer_id' => $orderBrand->freelancer_id,
            'reviewee_id' => $orderBrand->client_id,
            'rating' => 5,
            'comment' => 'Clear brief, fast feedback, instant milestone approvals. A pleasure to work with.',
        ]);

        /*
        |------------------------------------------------------------------
        | Conversations (mock chat: GreenField ↔ Jean-Pierre about the Flutter job)
        |------------------------------------------------------------------
        */
        $conversation = Conversation::query()->create([
            'client_id' => $clientUsers['greenfield']->id,
            'freelancer_id' => $freelancerUsers['jeanpierre']->id,
            'job_post_id' => $jobModels['flutter']->id,
        ]);

        $script = [
            ['client', 'Hello! I saw your Flutter profile and I think you would be a great fit for our AgriTech app project.'],
            ['freelancer', 'Thank you! Your project looks very interesting. I have experience building offline-first Flutter apps which sounds perfect for rural areas.'],
            ['client', 'Exactly! That offline capability is crucial. Our users often have limited connectivity in the field.'],
            ['freelancer', 'Understood. I used Hive for local storage with a background sync service in my last similar project — achieved ~95% data integrity even with spotty 2G connections.'],
            ['client', 'That sounds perfect! Can we schedule a call to discuss the milestone deliverables and your proposed timeline?'],
        ];

        foreach ($script as $index => [$side, $text]) {
            $conversation->messages()->create([
                'sender_id' => $side === 'client' ? $clientUsers['greenfield']->id : $freelancerUsers['jeanpierre']->id,
                'body' => $text,
                'created_at' => now()->subMinutes(60 - $index * 10),
            ]);
        }

        $conversation->update(['last_message_at' => now()->subMinutes(10)]);

        $this->seedInternships();

        app(NotificationService::class)->notify(
            $admin,
            'system',
            'Demo data ready',
            'The FIT demo dataset has been seeded.',
        );
    }

    /**
     * @param  array<string, User>  $freelancerUsers
     */
    private function seedServices(array $freelancerUsers, callable $skillIds): void
    {
        $services = [
            ['diane', 'Development & IT', 'I will build a responsive React landing page for your business', 'Pixel-perfect, mobile-first landing page built with React and Tailwind, deployed and SEO-ready.', 150000, 7, [
                ['basic', 'Basic', 'Single page, 3 sections, deployed', 150000, 7, 1, ['1 page', '3 sections', 'Deployment included']],
                ['standard', 'Standard', 'Up to 5 sections with contact form and analytics', 250000, 10, 2, ['5 sections', 'Contact form', 'Analytics setup', '2 revisions']],
                ['premium', 'Premium', 'Multi-page site with CMS and training session', 450000, 15, 3, ['Up to 5 pages', 'CMS integration', 'Training call', '3 revisions']],
            ]],
            ['kwame', 'Design & Creative', 'I will design a complete brand identity with logo and brand book', 'Logo, color system, typography and a full brand guidelines document for African market positioning.', 200000, 10, []],
            ['jeanpierre', 'Development & IT', 'I will develop a cross-platform Flutter mobile app', 'Offline-first Flutter app for Android and iOS with Firebase backend and store submission support.', 800000, 30, []],
            ['fatima', 'Digital Marketing', 'I will write bilingual SEO articles in French and English', 'Well-researched 1,500-word articles optimized for search, delivered in both languages.', 35000, 3, []],
        ];

        foreach ($services as [$freelancerKey, $categoryName, $title, $description, $price, $days, $packages]) {
            $service = Service::query()->firstOrCreate(
                ['title' => $title],
                [
                    'user_id' => $freelancerUsers[$freelancerKey]->id,
                    'category_id' => Category::query()->where('name_en', $categoryName)->firstOrFail()->id,
                    'slug' => Str::slug($title).'-'.Str::lower(Str::random(4)),
                    'description' => $description,
                    'price' => $price,
                    'delivery_days' => $days,
                    'revisions_included' => 2,
                    'status' => 'active',
                ],
            );

            foreach ($packages as [$tier, $name, $packageDescription, $packagePrice, $packageDays, $revisions, $features]) {
                $service->packages()->firstOrCreate(
                    ['tier' => $tier],
                    [
                        'name' => $name,
                        'description' => $packageDescription,
                        'price' => $packagePrice,
                        'delivery_days' => $packageDays,
                        'revisions_included' => $revisions,
                        'features' => $features,
                    ],
                );
            }
        }
    }

    private function seedInternships(): void
    {
        $internships = [
            ['Frontend Engineering Intern', 'MTN Innovation Lab', 'Douala, Cameroon', '3 months', 'XAF 150,000/mo', true, 'hybrid', ['React', 'TypeScript', 'CSS'], 'Work alongside senior engineers building the next generation of mobile money dashboards. Learn React, design systems, and agile development.'],
            ['UI/UX Design Intern', 'Afrikart Commerce', 'Yaoundé, Cameroon', '4 months', 'XAF 120,000/mo', true, 'remote', ['Figma', 'Adobe XD', 'Prototyping'], 'Help redesign the Afrikart mobile app experience. Collaborate with product managers on user research and prototyping.'],
            ['Data Science Intern', 'GreenField AgriTech', 'Bamenda, Cameroon', '6 months', 'XAF 200,000/mo', true, 'onsite', ['Python', 'SQL', 'Machine Learning'], 'Analyze agricultural data from IoT sensors across 3 West African countries. Build predictive models for crop yield optimization.'],
            ['Backend Developer Intern', 'CloudOps Cameroon', 'Bafoussam, Cameroon', '3 months', 'XAF 100,000/mo', true, 'remote', ['Node.js', 'PostgreSQL', 'Docker'], 'Contribute to our cloud infrastructure platform. Write APIs, optimize databases, and learn DevOps best practices.'],
            ['Content & Social Media Intern', 'TechAfrique Media', 'Douala, Cameroon', '3 months', null, false, 'remote', ['Content Writing', 'French', 'SEO'], "Create bilingual content about Africa's tech ecosystem. Manage social media accounts and track engagement analytics."],
        ];

        foreach ($internships as [$title, $company, $location, $duration, $stipend, $paid, $type, $skills, $description]) {
            Internship::query()->firstOrCreate(
                ['title' => $title, 'company_name' => $company],
                [
                    'location' => $location,
                    'duration' => $duration,
                    'stipend' => $stipend,
                    'is_paid' => $paid,
                    'type' => $type,
                    'skills' => $skills,
                    'description' => $description,
                ],
            );
        }
    }

    private function user(string $name, string $email, string $phone, string $role, int $cityId): User
    {
        $user = User::query()->firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'phone' => $phone,
                'password' => 'password',
                'role' => $role,
                'city_id' => $cityId,
                'referral_code' => strtoupper(Str::random(8)),
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ],
        );

        $user->wallet()->firstOrCreate([]);

        // firstOrCreate leaves DB-level defaults (connects_balance, status…) null in memory.
        return $user->refresh();
    }
}
