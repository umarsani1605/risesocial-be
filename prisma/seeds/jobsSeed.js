import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const prisma = new PrismaClient();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load LinkedIn Jobs data
const loadJobsData = () => {
  try {
    const dataPath = join(__dirname, '../../../frontend/data/jobs.json');
    const rawData = readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('❌ Error loading jobs data:', error);
    throw error;
  }
};

// Helper function untuk normalize company name menjadi slug
const normalizeSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .trim();
};

// Helper function untuk normalize job title menjadi slug
const normalizeJobSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .trim()
    .substring(0, 200); // Limit length
};

// Helper function untuk parse dan validate data
const validateJobData = (jobs) => {
  console.log('   🔍 Validating jobs data...');

  const errors = [];
  const validJobs = [];

  jobs.forEach((job, index) => {
    // Skip jobs tanpa data essential
    if (!job.id || !job.title || !job.organization) {
      errors.push(`Job ${index + 1}: Missing essential data (id, title, or organization)`);
      return;
    }

    // Validate title length
    if (job.title.length > 255) {
      job.title = job.title.substring(0, 255);
    }

    validJobs.push(job);
  });

  if (errors.length > 0) {
    console.warn(`⚠️  Skipped ${errors.length} invalid jobs`);
  }

  console.log(`   ✅ Validated ${validJobs.length} jobs successfully`);
  return validJobs;
};

// Helper function untuk extract dan deduplicate companies
const extractCompanies = (jobs) => {
  const companiesMap = new Map();

  jobs.forEach((job) => {
    const orgSlug = normalizeSlug(job.organization);

    if (!companiesMap.has(orgSlug)) {
      companiesMap.set(orgSlug, {
        name: job.organization,
        slug: orgSlug,
        logo_url: job.organization_logo || null,
        website_url: job.linkedin_org_url || null,
        industry: job.linkedin_org_industry || null,
        headquarters: job.linkedin_org_headquarters || null,
        description: job.linkedin_org_description || null,

        // LinkedIn specific data (FULL UTILIZATION!)
        linkedin_url: job.organization_url || null,
        linkedin_slug: job.linkedin_org_slug || null,
        linkedin_employees: job.linkedin_org_employees || null,
        linkedin_size: job.linkedin_org_size || null,
        linkedin_slogan: job.linkedin_org_slogan || null,
        linkedin_followers: job.linkedin_org_followers || null,
        linkedin_type: job.linkedin_org_type || null,
        linkedin_founded_date: job.linkedin_org_foundeddate || null,
        linkedin_specialties: job.linkedin_org_specialties || null,
        linkedin_locations: job.linkedin_org_locations || null,
        linkedin_is_recruitment_agency: job.linkedin_org_recruitment_agency_derived || false,
      });
    }
  });

  return Array.from(companiesMap.values());
};

// Helper function untuk extract dan deduplicate locations
const extractLocations = (jobs) => {
  const locationsMap = new Map();

  jobs.forEach((job) => {
    // Use derived location data
    const city = job.cities_derived?.[0] || null;
    const region = job.regions_derived?.[0] || null;
    const country = job.countries_derived?.[0] || 'Unknown';

    const locationKey = `${city}-${region}-${country}`;

    if (!locationsMap.has(locationKey)) {
      locationsMap.set(locationKey, {
        city,
        region,
        country,
        timezone: job.timezones_derived?.[0] || null,
        latitude: job.lats_derived?.[0] || null,
        longitude: job.lngs_derived?.[0] || null,
        raw_location_data: job.locations_raw || null,
        location_type: job.location_type || null,
        is_remote: job.remote_derived || false,
      });
    }
  });

  return Array.from(locationsMap.values());
};

export async function seedJobs() {
  console.log('🗑️  Cleaning existing jobs data...');

  try {
    // Clean existing data dalam transaction dengan urutan yang benar
    await prisma.$transaction(async (tx) => {
      await tx.jobApplication.deleteMany();
      await tx.userSavedJob.deleteMany();
      await tx.jobAIInsights.deleteMany();
      await tx.job.deleteMany();
      await tx.jobLocation.deleteMany();
      await tx.company.deleteMany();

      // Reset auto-increment sequences untuk semua tabel jobs
      const sequences = ['companies_id_seq', 'job_locations_id_seq', 'jobs_id_seq', 'job_ai_insights_id_seq', 'job_applications_id_seq'];

      for (const seq of sequences) {
        await tx.$executeRawUnsafe(`ALTER SEQUENCE ${seq} RESTART WITH 1`);
      }
    });

    console.log('✅ Deleted all existing jobs data and reset sequences.');

    // Load dan validate data
    const jobsData = loadJobsData();
    console.log(`📊 Loaded ${jobsData.length} jobs from LinkedIn API data`);

    // Take first 50 jobs untuk testing (untuk avoid rate limits dan testing)
    const sampleJobs = jobsData.slice(0, 50);
    const validJobs = validateJobData(sampleJobs);

    console.log('🏢 Processing companies and locations...');

    // Extract companies dan locations
    const companies = extractCompanies(validJobs);
    const locations = extractLocations(validJobs);

    console.log(`   📊 Found ${companies.length} unique companies`);
    console.log(`   🌍 Found ${locations.length} unique locations`);

    // Seed companies
    await prisma.$transaction(async (tx) => {
      console.log('   🏢 Creating companies...');
      await tx.company.createMany({
        data: companies,
        skipDuplicates: true,
      });
      console.log(`   ✅ Created ${companies.length} companies`);

      console.log('   🌍 Creating locations...');
      await tx.jobLocation.createMany({
        data: locations,
        skipDuplicates: true,
      });
      console.log(`   ✅ Created ${locations.length} locations`);
    });

    // Fetch created companies dan locations untuk mapping
    const createdCompanies = await prisma.company.findMany({
      select: { id: true, slug: true },
    });
    const createdLocations = await prisma.jobLocation.findMany({
      select: { id: true, city: true, region: true, country: true },
    });

    // Create mapping untuk efficient lookup
    const companyMap = new Map(createdCompanies.map((c) => [c.slug, c.id]));
    const locationMap = new Map(createdLocations.map((l) => [`${l.city}-${l.region}-${l.country}`, l.id]));

    console.log('💼 Creating jobs with AI insights...');

    // Process jobs dalam batch untuk performance
    let processedCount = 0;
    const batchSize = 10;

    for (let i = 0; i < validJobs.length; i += batchSize) {
      const batch = validJobs.slice(i, i + batchSize);

      await prisma.$transaction(async (tx) => {
        for (const jobData of batch) {
          // Get company dan location IDs
          const companySlug = normalizeSlug(jobData.organization);
          const companyId = companyMap.get(companySlug);

          const city = jobData.cities_derived?.[0] || null;
          const region = jobData.regions_derived?.[0] || null;
          const country = jobData.countries_derived?.[0] || 'Unknown';
          const locationKey = `${city}-${region}-${country}`;
          const locationId = locationMap.get(locationKey);

          if (!companyId) {
            console.warn(`⚠️  Company not found for: ${jobData.organization}`);
            continue;
          }

          // Create job dengan FULL LinkedIn API data
          const job = await tx.job.create({
            data: {
              title: jobData.title,
              slug: normalizeJobSlug(jobData.title),
              company_id: companyId,
              location_id: locationId,
              description: jobData.description_text || '',
              employment_type: jobData.employment_type?.[0] || 'FULL_TIME',
              seniority_level: jobData.seniority || null,
              status: 'active',
              direct_apply: jobData.directapply || true,
              external_url: jobData.url || null,
              posted_date: new Date(jobData.date_posted),
              valid_until: jobData.date_validthrough ? new Date(jobData.date_validthrough) : null,

              // Source tracking (FULL UTILIZATION)
              source_type: jobData.source_type || null,
              source: jobData.source || null,
              source_domain: jobData.source_domain || null,
              source_url: jobData.url || null,
              linkedin_job_id: jobData.id || null,

              // Recruiter information (FULL UTILIZATION)
              recruiter_name: jobData.recruiter_name || null,
              recruiter_title: jobData.recruiter_title || null,
              recruiter_url: jobData.recruiter_url || null,

              // Raw salary data
              salary_raw: jobData.salary_raw
                ? typeof jobData.salary_raw === 'object'
                  ? JSON.stringify(jobData.salary_raw)
                  : jobData.salary_raw
                : null,

              // Location requirements
              location_requirements_raw: jobData.location_requirements_raw
                ? Array.isArray(jobData.location_requirements_raw) || typeof jobData.location_requirements_raw === 'object'
                  ? JSON.stringify(jobData.location_requirements_raw)
                  : jobData.location_requirements_raw
                : null,

              // Timestamps
              api_created_at: jobData.date_created ? new Date(jobData.date_created) : null,
            },
          });

          // Create AI insights jika ada data (GAME CHANGER!)
          const hasAIData =
            jobData.ai_salary_currency ||
            jobData.ai_key_skills ||
            jobData.ai_experience_level ||
            jobData.ai_work_arrangement ||
            jobData.ai_benefits ||
            jobData.ai_core_responsibilities;

          if (hasAIData) {
            await tx.jobAIInsights.create({
              data: {
                job_id: job.id,

                // AI Salary Analysis
                ai_salary_currency: jobData.ai_salary_currency || null,
                ai_salary_value: jobData.ai_salary_value || null,
                ai_salary_min_value: jobData.ai_salary_minvalue || null,
                ai_salary_max_value: jobData.ai_salary_maxvalue || null,
                ai_salary_unit_text: jobData.ai_salary_unittext || null,

                // AI Job Content Analysis
                ai_benefits: Array.isArray(jobData.ai_benefits) ? jobData.ai_benefits.join('\n') : jobData.ai_benefits || null,
                ai_experience_level: jobData.ai_experience_level || null,
                ai_work_arrangement: jobData.ai_work_arrangement || null,
                ai_work_arrangement_days: jobData.ai_work_arrangement_office_days || null,
                ai_remote_location: Array.isArray(jobData.ai_remote_location)
                  ? jobData.ai_remote_location.join(', ')
                  : jobData.ai_remote_location || null,
                ai_remote_location_derived: Array.isArray(jobData.ai_remote_location_derived)
                  ? jobData.ai_remote_location_derived.join(', ')
                  : jobData.ai_remote_location_derived || null,

                // AI Skills & Requirements Analysis
                ai_key_skills: Array.isArray(jobData.ai_key_skills) ? jobData.ai_key_skills.join(', ') : jobData.ai_key_skills || null,
                ai_core_responsibilities: jobData.ai_core_responsibilities || null,
                ai_requirements_summary: jobData.ai_requirements_summary || null,

                // AI Work Details
                ai_working_hours: jobData.ai_working_hours ? String(jobData.ai_working_hours) : null,
                ai_job_language: jobData.ai_job_language || null,
                ai_visa_sponsorship: jobData.ai_visa_sponsorship || null,

                // AI Hiring Manager Analysis
                ai_hiring_manager_name: jobData.ai_hiring_manager_name || null,
                ai_hiring_manager_email: jobData.ai_hiring_manager_email_address || null,
              },
            });
          }

          processedCount++;
        }
      });

      console.log(`   💼 Processed ${Math.min(i + batchSize, validJobs.length)}/${validJobs.length} jobs`);
    }

    // Summary
    console.log('\n📊 Jobs seeding summary:');
    console.log(`   🏢 Companies: ${companies.length}`);
    console.log(`   🌍 Locations: ${locations.length}`);
    console.log(`   💼 Jobs: ${processedCount}`);
    console.log(`   🤖 AI Insights: Auto-generated untuk jobs dengan AI data`);

    console.log('\n🚀 Full LinkedIn API features implemented:');
    console.log('   ✅ Rich company profiles dengan 15+ LinkedIn fields');
    console.log('   ✅ GPS coordinates & timezone data');
    console.log('   ✅ AI-enhanced salary, skills, & work arrangement data');
    console.log('   ✅ Complete recruiter information');
    console.log('   ✅ Source tracking & LinkedIn job IDs');
    console.log('   ✅ Optimized relational structure');
  } catch (error) {
    console.error('❌ Error seeding jobs data:', error);
    throw error;
  }
}
