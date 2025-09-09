<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $organizations = [
            ['organization_name' => 'AGILA: Rescue Group', 'description' => 'Emergency response and rescue organization'],
            ['organization_name' => 'Association of Student Internal Auditors', 'description' => 'Internal auditing and financial oversight organization'],
            ['organization_name' => 'Business Administration', 'description' => 'Business studies and administration organization'],
            ['organization_name' => 'College Red Cross Youth', 'description' => 'Red Cross youth organization for humanitarian work'],
            ['organization_name' => 'Communicators\' Guild', 'description' => 'Communication and media organization'],
            ['organization_name' => 'Computer Studies Program', 'description' => 'Computer science and IT studies organization'],
            ['organization_name' => 'Criminal Justice Program', 'description' => 'Criminal justice and law studies organization'],
            ['organization_name' => 'Engineering and Technology Program', 'description' => 'Engineering and technology studies organization'],
            ['organization_name' => 'FSUU Dance Company', 'description' => 'University dance and performing arts organization'],
            ['organization_name' => 'FSUU Gawad Kalinga Youth', 'description' => 'Community development and Gawad Kalinga youth organization'],
            ['organization_name' => 'FSUU Rover Leaders Circle', 'description' => 'Leadership and scouting organization'],
            ['organization_name' => 'JPMAP', 'description' => 'Junior Philippine Medical Association'],
            ['organization_name' => 'Junior Philippine Institute of Accountants', 'description' => 'Accounting studies organization'],
            ['organization_name' => 'Junior Social Entrepreneurs Society', 'description' => 'Social entrepreneurship organization'],
            ['organization_name' => 'Nursing Program', 'description' => 'Nursing studies organization'],
            ['organization_name' => 'Philippine Institute of Civil Engineers', 'description' => 'Civil engineering organization'],
            ['organization_name' => 'Philippine Institute of Industrial Engineers', 'description' => 'Industrial engineering organization'],
            ['organization_name' => 'Philippine Student Nurses Association', 'description' => 'Student nurses association'],
            ['organization_name' => 'Political Science and Economic Society', 'description' => 'Political science and economics studies organization'],
            ['organization_name' => 'Psychological Society', 'description' => 'Psychology studies organization'],
            ['organization_name' => 'Society of Human Services Students', 'description' => 'Human services and social work organization'],
            ['organization_name' => 'Student Assistant Organization', 'description' => 'Student assistant and peer mentoring organization'],
            ['organization_name' => 'Teachers Education Program', 'description' => 'Teacher education and training organization'],
            ['organization_name' => 'THYMES', 'description' => 'Theater and performing arts organization'],
            ['organization_name' => 'The Urian Arena Vanguard', 'description' => 'Sports and athletics organization'],
            ['organization_name' => 'Urian Cybersecurity League', 'description' => 'Cybersecurity and information security organization'],
            ['organization_name' => 'Urian Debate Society', 'description' => 'Debate and public speaking organization'],
            ['organization_name' => 'UTHYP FSU Chapter', 'description' => 'Upsilon Theta Epsilon Psi Fraternity Sorority chapter'],
            ['organization_name' => 'Voices of Light Chorale', 'description' => 'Choral and music organization']
        ];

        foreach ($organizations as $organization) {
            \App\Models\Organization::create($organization);
        }
    }
}
