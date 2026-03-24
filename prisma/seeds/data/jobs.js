/**
 * Job seed data generator
 * Generates 30 job postings with comprehensive details and AI insights
 */

import { randomDateWithinDays } from '../utils/date.js';

/**
 * Generate job data for given companies and locations
 * @param {Array} companyIds - Array of company IDs
 * @param {Array} locationIds - Array of location IDs
 * @returns {Array} Array of job objects with AI insights
 */
export function generateJobs(companyIds, locationIds) {
  const jobs = [];

  const jobTemplates = [
    {
      title: 'Senior Full Stack Developer',
      employment_type: 'FULL_TIME',
      seniority_level: 'Senior',
      description: `We are seeking an experienced Senior Full Stack Developer to join our dynamic engineering team and lead the development of cutting-edge web applications. In this role, you will architect and implement scalable solutions using modern technologies, mentor junior developers, and collaborate with cross-functional teams to deliver high-quality products. You will work on challenging problems involving microservices architecture, real-time data processing, and cloud-native applications that serve millions of users globally.

Key Responsibilities: Design and develop robust full stack applications using React, Node.js, and PostgreSQL. Architect scalable microservices and RESTful APIs following industry best practices. Lead code reviews and establish coding standards for the team. Optimize application performance and implement caching strategies. Collaborate with product managers and designers to translate requirements into technical solutions. Mentor junior developers and conduct technical training sessions. Participate in agile ceremonies including sprint planning and retrospectives. Troubleshoot production issues and implement monitoring solutions.

Required Qualifications: 5+ years of professional software development experience. Expert-level proficiency in JavaScript, TypeScript, React, and Node.js. Strong understanding of database design, SQL, and ORM frameworks. Experience with cloud platforms (AWS, GCP, or Azure). Solid grasp of software design patterns and architectural principles. Proficiency with Git, CI/CD pipelines, and DevOps practices. Excellent problem-solving and communication skills. Bachelor's degree in Computer Science or equivalent experience.

Preferred Qualifications: Experience with Docker and Kubernetes. Knowledge of GraphQL and modern API design. Familiarity with testing frameworks (Jest, Cypress). Understanding of security best practices and OWASP guidelines. Contributions to open-source projects. Experience leading technical projects or teams.`,
      ai_salary_min: 15000000,
      ai_salary_max: 25000000,
      ai_key_skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'AWS', 'Docker'],
      ai_experience_level: 'Senior (5+ years)',
      ai_work_arrangement: 'Hybrid',
    },
    {
      title: 'ESG Analyst',
      employment_type: 'FULL_TIME',
      seniority_level: 'Mid-Level',
      description: `Join our sustainability team as an ESG Analyst and help drive our environmental, social, and governance initiatives. You will conduct comprehensive ESG assessments, prepare sustainability reports, analyze ESG data, and support the development of corporate sustainability strategies. This role offers the opportunity to make a meaningful impact on our organization's sustainability journey while working with senior leadership and external stakeholders.

Key Responsibilities: Conduct ESG materiality assessments and stakeholder engagement. Prepare sustainability reports following GRI, SASB, and TCFD frameworks. Collect, analyze, and manage ESG data across the organization. Monitor ESG regulations and industry best practices. Support carbon footprint calculations and climate risk assessments. Collaborate with business units to implement sustainability initiatives. Prepare presentations for executive leadership and board committees. Research emerging ESG trends and benchmarking against peers.

Required Qualifications: 3+ years of experience in ESG, sustainability, or corporate social responsibility. Strong understanding of ESG frameworks (GRI, SASB, TCFD). Excellent analytical and data management skills. Proficiency in Excel, PowerPoint, and data visualization tools. Strong written and verbal communication skills. Bachelor's degree in Environmental Science, Business, or related field. Attention to detail and ability to manage multiple projects.

Preferred Qualifications: Experience with ESG software platforms. Knowledge of carbon accounting methodologies. Understanding of climate science and environmental regulations. Certification in sustainability (e.g., GRI, SASB). Experience in stakeholder engagement and reporting.`,
      ai_salary_min: 8000000,
      ai_salary_max: 14000000,
      ai_key_skills: ['ESG Analysis', 'Sustainability Reporting', 'Data Analysis', 'GRI', 'SASB', 'Excel'],
      ai_experience_level: 'Mid-Level (3-5 years)',
      ai_work_arrangement: 'Hybrid',
    },
    {
      title: 'Data Scientist',
      employment_type: 'FULL_TIME',
      seniority_level: 'Mid-Level',
      description: `We are looking for a talented Data Scientist to join our analytics team and unlock insights from complex datasets. You will build machine learning models, conduct statistical analyses, and develop data-driven solutions that directly impact business decisions. This role offers exposure to diverse problems across marketing, operations, and product development with opportunities to work with cutting-edge ML technologies.

Key Responsibilities: Develop and deploy machine learning models for prediction and classification. Perform exploratory data analysis to identify patterns and insights. Design and conduct A/B tests to measure feature impact. Build data pipelines and automate analytical workflows. Create compelling visualizations and dashboards for stakeholders. Collaborate with engineering teams to productionize models. Present findings to non-technical audiences including executives. Stay current with latest ML research and techniques.

Required Qualifications: 3+ years of experience in data science or machine learning. Strong proficiency in Python and libraries (Pandas, NumPy, Scikit-learn). Experience with SQL and database querying. Solid understanding of statistics and experimental design. Experience deploying ML models to production. Strong communication and storytelling skills. Master's degree in Data Science, Statistics, Computer Science, or related field.

Preferred Qualifications: Experience with deep learning frameworks (TensorFlow, PyTorch). Knowledge of big data technologies (Spark, Hadoop). Familiarity with cloud ML services (AWS SageMaker, GCP AI Platform). Experience with MLOps and model monitoring. Publications or Kaggle competition experience.`,
      ai_salary_min: 12000000,
      ai_salary_max: 20000000,
      ai_key_skills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'TensorFlow', 'Data Visualization'],
      ai_experience_level: 'Mid-Level (3-5 years)',
      ai_work_arrangement: 'Remote',
    },
    {
      title: 'Frontend Developer',
      employment_type: 'FULL_TIME',
      seniority_level: 'Junior',
      description: `Join our frontend team as a Junior Frontend Developer and help build beautiful, responsive user interfaces. You will work with modern frameworks, collaborate with designers and backend developers, and contribute to products used by thousands of customers daily. This is an excellent opportunity for early-career developers to grow their skills in a supportive environment.

Key Responsibilities: Develop responsive web applications using React or Vue.js. Implement pixel-perfect designs from Figma mockups. Write clean, maintainable, and well-documented code. Participate in code reviews and learn from senior developers. Fix bugs and optimize application performance. Collaborate with UX designers and backend engineers. Write unit tests for frontend components. Stay updated with frontend development trends.

Required Qualifications: 1-2 years of frontend development experience. Proficiency in HTML, CSS, and JavaScript. Experience with React or Vue.js. Understanding of responsive design principles. Familiarity with Git version control. Good problem-solving and debugging skills. Bachelor's degree in Computer Science or bootcamp graduate.

Preferred Qualifications: Experience with TypeScript. Knowledge of state management (Redux, Vuex). Familiarity with CSS frameworks (Tailwind, Bootstrap). Understanding of web accessibility standards. Portfolio of personal projects.`,
      ai_salary_min: 6000000,
      ai_salary_max: 10000000,
      ai_key_skills: ['React', 'Vue.js', 'JavaScript', 'HTML', 'CSS', 'Git'],
      ai_experience_level: 'Junior (1-2 years)',
      ai_work_arrangement: 'On-site',
    },
    {
      title: 'DevOps Engineer',
      employment_type: 'FULL_TIME',
      seniority_level: 'Senior',
      description: `We are seeking a Senior DevOps Engineer to design and maintain our cloud infrastructure, automate deployment pipelines, and ensure system reliability. You will work with development teams to streamline workflows, implement monitoring solutions, and optimize infrastructure costs. This role requires deep technical expertise and the ability to balance innovation with operational stability.

Key Responsibilities: Design and manage cloud infrastructure on AWS or GCP. Build and maintain CI/CD pipelines using Jenkins, GitLab CI, or GitHub Actions. Implement infrastructure as code using Terraform or CloudFormation. Monitor system performance and implement alerting solutions. Optimize infrastructure costs and resource utilization. Ensure security best practices and compliance requirements. Troubleshoot production incidents and conduct root cause analysis. Mentor team members on DevOps practices and tools.

Required Qualifications: 5+ years of DevOps or infrastructure engineering experience. Expert knowledge of AWS or GCP services. Strong experience with Docker and Kubernetes. Proficiency in scripting languages (Python, Bash, Go). Experience with infrastructure as code tools. Understanding of networking, security, and system administration. Strong troubleshooting and problem-solving skills. Bachelor's degree in Computer Science or related field.

Preferred Qualifications: Certifications (AWS Solutions Architect, CKA). Experience with service mesh (Istio, Linkerd). Knowledge of observability tools (Prometheus, Grafana, ELK). Experience with GitOps workflows. Understanding of FinOps principles.`,
      ai_salary_min: 18000000,
      ai_salary_max: 28000000,
      ai_key_skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Python'],
      ai_experience_level: 'Senior (5+ years)',
      ai_work_arrangement: 'Remote',
    },
  ];

  // Generate 30 jobs by cycling through templates and distributing across companies
  for (let i = 0; i < 30; i++) {
    const template = jobTemplates[i % jobTemplates.length];
    const companyId = companyIds[i % companyIds.length];
    const locationId = locationIds[i % locationIds.length];
    const jobNumber = i + 1;

    jobs.push({
      title: template.title,
      slug: `${template.title.toLowerCase().replace(/\s+/g, '-')}-${jobNumber}`,
      company_id: companyId,
      location_id: locationId,
      description: template.description,
      employment_type: template.employment_type,
      seniority_level: template.seniority_level,
      posted_date: randomDateWithinDays(30),
      ai_insights: {
        ai_salary_min_value: template.ai_salary_min,
        ai_salary_max_value: template.ai_salary_max,
        ai_salary_currency: 'IDR',
        ai_key_skills: template.ai_key_skills,
        ai_experience_level: template.ai_experience_level,
        ai_work_arrangement: template.ai_work_arrangement,
      },
    });
  }

  return jobs;
}

/**
 * Generate job location data
 * @returns {Array} Array of 15 diverse job locations
 */
export function generateJobLocations() {
  return [
    {
      city: 'Jakarta',
      region: 'DKI Jakarta',
      country: 'Indonesia',
      timezone: 'Asia/Jakarta',
      latitude: -6.2088,
      longitude: 106.8456,
      is_remote: false,
    },
    {
      city: 'Surabaya',
      region: 'Jawa Timur',
      country: 'Indonesia',
      timezone: 'Asia/Jakarta',
      latitude: -7.2575,
      longitude: 112.7521,
      is_remote: false,
    },
    {
      city: 'Bandung',
      region: 'Jawa Barat',
      country: 'Indonesia',
      timezone: 'Asia/Jakarta',
      latitude: -6.9175,
      longitude: 107.6191,
      is_remote: false,
    },
    {
      city: 'Singapore',
      region: 'Singapore',
      country: 'Singapore',
      timezone: 'Asia/Singapore',
      latitude: 1.3521,
      longitude: 103.8198,
      is_remote: false,
    },
    {
      city: 'Kuala Lumpur',
      region: 'Federal Territory',
      country: 'Malaysia',
      timezone: 'Asia/Kuala_Lumpur',
      latitude: 3.139,
      longitude: 101.6869,
      is_remote: false,
    },
    {
      city: 'Bangkok',
      region: 'Bangkok',
      country: 'Thailand',
      timezone: 'Asia/Bangkok',
      latitude: 13.7563,
      longitude: 100.5018,
      is_remote: false,
    },
    {
      city: 'Manila',
      region: 'Metro Manila',
      country: 'Philippines',
      timezone: 'Asia/Manila',
      latitude: 14.5995,
      longitude: 120.9842,
      is_remote: false,
    },
    {
      city: 'Ho Chi Minh City',
      region: 'Ho Chi Minh',
      country: 'Vietnam',
      timezone: 'Asia/Ho_Chi_Minh',
      latitude: 10.8231,
      longitude: 106.6297,
      is_remote: false,
    },
    {
      city: 'Bali',
      region: 'Bali',
      country: 'Indonesia',
      timezone: 'Asia/Makassar',
      latitude: -8.3405,
      longitude: 115.092,
      is_remote: false,
    },
    {
      city: 'Yogyakarta',
      region: 'DI Yogyakarta',
      country: 'Indonesia',
      timezone: 'Asia/Jakarta',
      latitude: -7.7956,
      longitude: 110.3695,
      is_remote: false,
    },
    {
      city: 'Semarang',
      region: 'Jawa Tengah',
      country: 'Indonesia',
      timezone: 'Asia/Jakarta',
      latitude: -6.9932,
      longitude: 110.4203,
      is_remote: false,
    },
    {
      city: 'Remote',
      region: 'Global',
      country: 'Remote',
      timezone: 'UTC',
      latitude: 0,
      longitude: 0,
      is_remote: true,
    },
    {
      city: 'Medan',
      region: 'Sumatera Utara',
      country: 'Indonesia',
      timezone: 'Asia/Jakarta',
      latitude: 3.5952,
      longitude: 98.6722,
      is_remote: false,
    },
    {
      city: 'Makassar',
      region: 'Sulawesi Selatan',
      country: 'Indonesia',
      timezone: 'Asia/Makassar',
      latitude: -5.1477,
      longitude: 119.4327,
      is_remote: false,
    },
    {
      city: 'Denpasar',
      region: 'Bali',
      country: 'Indonesia',
      timezone: 'Asia/Makassar',
      latitude: -8.6705,
      longitude: 115.2126,
      is_remote: false,
    },
  ];
}
