<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Skill;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        // Categories from spec section 1 with the skills the frontends use.
        $categories = [
            ['name_en' => 'Development & IT', 'name_fr' => 'Développement & IT', 'icon' => 'code', 'skills' => [
                'React', 'Node.js', 'TypeScript', 'Python', 'Flutter', 'Dart', 'PostgreSQL', 'MongoDB',
                'MySQL', 'AWS', 'Docker', 'GraphQL', 'Vue.js', 'Django', 'Next.js', 'Swift', 'Kotlin',
                'Firebase', 'REST API', 'Laravel', 'PHP', 'React Native',
            ]],
            ['name_en' => 'Design & Creative', 'name_fr' => 'Design & Création', 'icon' => 'brush', 'skills' => [
                'Figma', 'Adobe XD', 'Adobe Illustrator', 'Logo Design', 'Brand Identity', 'UI/UX',
                'Motion Design', 'Webflow', 'Photoshop', 'Prototyping',
            ]],
            ['name_en' => 'Video & Photography', 'name_fr' => 'Vidéo & Photographie', 'icon' => 'camera', 'skills' => [
                'Video Editing', 'Photography', 'Photo Retouching', 'After Effects', 'Premiere Pro',
            ]],
            ['name_en' => 'Digital Marketing', 'name_fr' => 'Marketing digital', 'icon' => 'trending-up', 'skills' => [
                'SEO', 'Content Strategy', 'Community Management', 'Meta Ads', 'Copywriting', 'Content Writing',
                'Tech Journalism', 'WordPress',
            ]],
            ['name_en' => 'Education & Tutoring', 'name_fr' => 'Éducation & Tutorat', 'icon' => 'graduation-cap', 'skills' => [
                'Mathematics', 'Physics', 'Exam Preparation', 'French', 'English',
            ]],
            ['name_en' => 'Technical Services', 'name_fr' => 'Services techniques', 'icon' => 'wrench', 'skills' => [
                'Electricity', 'Plumbing', 'Computer Repair', 'Network Installation',
            ]],
            ['name_en' => 'Business & Administration', 'name_fr' => 'Business & Administration', 'icon' => 'briefcase', 'skills' => [
                'Business Plan', 'Accounting', 'Data Entry', 'Translation', 'Virtual Assistance',
                'Customer Support', 'Zendesk', 'Email Management', 'Excel',
            ]],
            ['name_en' => 'Events & Local Services', 'name_fr' => 'Événementiel & Services locaux', 'icon' => 'calendar', 'skills' => [
                'Decoration', 'Event Planning', 'Catering', 'Delivery',
            ]],
            ['name_en' => 'Data & Analytics', 'name_fr' => 'Données & Analytique', 'icon' => 'bar-chart', 'skills' => [
                'SQL', 'Tableau', 'Power BI', 'Machine Learning', 'Data Analysis',
            ]],
        ];

        foreach ($categories as $index => $categoryData) {
            $category = Category::query()->updateOrCreate(
                ['slug' => Str::slug($categoryData['name_en'])],
                [
                    'name_en' => $categoryData['name_en'],
                    'name_fr' => $categoryData['name_fr'],
                    'icon' => $categoryData['icon'],
                    'sort_order' => $index,
                ],
            );

            foreach ($categoryData['skills'] as $skillName) {
                Skill::query()->firstOrCreate(
                    ['slug' => Str::slug($skillName)],
                    ['name' => $skillName, 'category_id' => $category->id],
                );
            }
        }
    }
}
