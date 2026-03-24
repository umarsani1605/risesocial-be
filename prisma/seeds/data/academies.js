/**
 * Academy seed data with comprehensive nested structures
 *
 * This file contains 3 academies with:
 * - 500+ word SEO-friendly descriptions
 * - 2+ pricing tiers per academy
 * - 5+ features per academy
 * - 3+ themes per academy
 * - 3+ topics per theme
 * - 2+ instructors per academy
 * - 3+ testimonials per academy
 * - 5+ FAQs per academy
 */

export const academies = [
  {
    title: 'ESG Academy: Sustainability & Impact Leadership',
    slug: 'esg-academy',
    description: `Transform your career with comprehensive ESG (Environmental, Social, and Governance) expertise that positions you at the forefront of the global sustainability movement. Our ESG Academy is meticulously designed for professionals who want to lead the sustainability revolution in their organizations and make a lasting impact on business and society. In today's rapidly evolving business landscape, ESG has become a critical factor in corporate strategy, investment decisions, regulatory compliance, and stakeholder engagement. Companies worldwide are seeking qualified ESG professionals who can navigate complex sustainability challenges, implement effective strategies, and drive measurable impact. This academy provides you with the knowledge, tools, frameworks, and practical experience to become that sought-after expert.

Throughout this intensive 10-week program, you'll master the fundamentals of ESG reporting frameworks including GRI (Global Reporting Initiative), SASB (Sustainability Accounting Standards Board), TCFD (Task Force on Climate-related Financial Disclosures), and the emerging ISSB standards. You'll learn how to conduct comprehensive materiality assessments that identify the most significant ESG issues for your organization, develop robust sustainability strategies aligned with business objectives, and measure impact using key performance indicators that matter to investors and stakeholders. Our curriculum covers critical topics including carbon footprint calculation and reduction strategies, climate risk assessment and scenario analysis, supply chain sustainability and due diligence, diversity equity and inclusion initiatives, human rights compliance, board governance best practices, and stakeholder engagement methodologies.

The program combines theoretical knowledge with practical application through real-world case studies from leading companies across diverse industries. You'll analyze how organizations like Unilever, Patagonia, Interface, Microsoft, and Danone have successfully integrated sustainability into their core business models and achieved competitive advantages. Interactive workshops will guide you through creating comprehensive ESG reports that meet international standards, developing stakeholder engagement strategies that build trust and transparency, conducting ESG risk assessments, and presenting sustainability initiatives to executive leadership and boards of directors. You'll also gain hands-on experience with ESG data management platforms, carbon accounting software, and sustainability reporting tools used by professionals worldwide.

Our expert instructors bring decades of combined experience from leading consulting firms, multinational corporations, investment firms, and sustainability organizations. They'll share insider insights on navigating evolving ESG regulations across different jurisdictions, responding to investor demands for transparency and accountability, building compelling business cases for sustainability investments, and overcoming common implementation challenges. You'll also learn about emerging trends and innovations including circular economy principles and business models, nature-based solutions for climate mitigation, biodiversity conservation strategies, social impact measurement frameworks, sustainable finance and green bonds, and the intersection of ESG with digital transformation and artificial intelligence.

The academy includes guest lectures from industry leaders, networking opportunities with sustainability professionals, access to exclusive ESG resources and templates, and personalized mentorship to support your career goals. You'll work on a capstone project where you develop a comprehensive ESG strategy for a real or simulated organization, demonstrating your ability to apply everything you've learned. By the end of this academy, you'll be equipped to drive ESG transformation in your organization, whether you're working in sustainability, corporate strategy, investor relations, risk management, or operations. You'll receive a professional certificate recognized by industry leaders globally and gain access to our exclusive alumni network of over 500 sustainability professionals across 40 countries. Join us in building a more sustainable, equitable, and prosperous future for business and society.`,
    duration: '10 weeks',
    format: 'Online Live Sessions + Self-Paced',
    category: 'Sustainability',
    image_url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9',
    certificate: true,
    portfolio: true,
    status: 'ACTIVE',
    pricing: [
      {
        name: 'Early Bird',
        original_price: 5000000,
        discount_price: 3500000,
        order: 1,
      },
      {
        name: 'Regular',
        original_price: 5000000,
        discount_price: 4000000,
        order: 2,
      },
      {
        name: 'Installment Plan',
        original_price: 5500000,
        discount_price: 5500000,
        order: 3,
      },
    ],
    features: [
      {
        title: 'Comprehensive ESG Framework Training',
        description: 'Master GRI, SASB, TCFD, and other leading ESG reporting standards',
        icon: 'book-open',
        order: 1,
      },
      {
        title: 'Real-World Case Studies',
        description: 'Analyze sustainability strategies from Fortune 500 companies',
        icon: 'briefcase',
        order: 2,
      },
      {
        title: 'Carbon Footprint Calculation Tools',
        description: 'Learn to measure and report organizational carbon emissions',
        icon: 'leaf',
        order: 3,
      },
      {
        title: 'Stakeholder Engagement Strategies',
        description: 'Develop effective communication plans for ESG initiatives',
        icon: 'users',
        order: 4,
      },
      {
        title: 'Industry-Recognized Certificate',
        description: 'Earn a professional certificate valued by employers globally',
        icon: 'award',
        order: 5,
      },
      {
        title: 'Alumni Network Access',
        description: 'Join a community of sustainability professionals worldwide',
        icon: 'network',
        order: 6,
      },
    ],
    themes: [
      {
        title: 'ESG Fundamentals & Frameworks',
        description: 'Understanding the core principles of environmental, social, and governance practices',
        order: 1,
        topics: [
          {
            title: 'Introduction to ESG and Sustainability',
            description: 'Overview of ESG concepts, history, and business relevance',
            order: 1,
          },
          {
            title: 'Global ESG Reporting Standards',
            description: 'Deep dive into GRI, SASB, TCFD, and ISSB frameworks',
            order: 2,
          },
          {
            title: 'Materiality Assessment & Stakeholder Mapping',
            description: 'Identifying and prioritizing ESG issues for your organization',
            order: 3,
          },
          {
            title: 'ESG Data Collection & Management',
            description: 'Systems and processes for gathering reliable ESG data',
            order: 4,
          },
        ],
      },
      {
        title: 'Environmental Sustainability',
        description: 'Climate action, carbon management, and environmental stewardship',
        order: 2,
        topics: [
          {
            title: 'Climate Change & Carbon Footprint',
            description: 'Understanding climate science and calculating organizational emissions',
            order: 1,
          },
          {
            title: 'Renewable Energy & Energy Efficiency',
            description: 'Transitioning to clean energy and reducing consumption',
            order: 2,
          },
          {
            title: 'Circular Economy & Waste Management',
            description: 'Designing out waste and keeping materials in use',
            order: 3,
          },
          {
            title: 'Water Stewardship & Biodiversity',
            description: 'Managing water resources and protecting ecosystems',
            order: 4,
          },
        ],
      },
      {
        title: 'Social Impact & Governance',
        description: 'Human rights, diversity, ethics, and corporate governance',
        order: 3,
        topics: [
          {
            title: 'Diversity, Equity & Inclusion (DEI)',
            description: 'Building inclusive workplaces and measuring progress',
            order: 1,
          },
          {
            title: 'Human Rights & Labor Practices',
            description: 'Ensuring fair treatment across the value chain',
            order: 2,
          },
          {
            title: 'Corporate Governance & Ethics',
            description: 'Board oversight, transparency, and ethical business conduct',
            order: 3,
          },
          {
            title: 'Community Engagement & Social Impact',
            description: 'Creating positive outcomes for local communities',
            order: 4,
          },
        ],
      },
    ],
    instructors: [
      {
        name: 'Dr. Maya Patel',
        job_title: 'Chief Sustainability Officer, Global Tech Corp',
        avatar_url: 'https://i.pravatar.cc/150?img=47',
        description:
          'Dr. Patel has 15+ years of experience leading ESG initiatives at Fortune 500 companies. She holds a PhD in Environmental Science and has published extensively on corporate sustainability.',
        order: 1,
      },
      {
        name: 'James Chen',
        job_title: 'ESG Investment Director, Green Capital Partners',
        avatar_url: 'https://i.pravatar.cc/150?img=13',
        description:
          'James specializes in ESG integration for investment decisions, managing over $2B in sustainable assets. He is a CFA charterholder and frequent speaker at sustainability conferences.',
        order: 2,
      },
      {
        name: 'Sofia Rodriguez',
        job_title: 'Sustainability Consultant, Impact Advisory',
        avatar_url: 'https://i.pravatar.cc/150?img=32',
        description:
          'Sofia has advised 50+ organizations on ESG strategy and reporting. She is a certified GRI trainer and expert in stakeholder engagement and materiality assessments.',
        order: 3,
      },
    ],
    testimonials: [
      {
        name: 'Rina Kusuma',
        avatar_url: 'https://i.pravatar.cc/150?img=28',
        comment:
          'This ESG Academy transformed my career! I went from knowing nothing about sustainability to leading ESG initiatives at my company. The instructors are world-class and the content is incredibly practical.',
        order: 1,
      },
      {
        name: 'David Tan',
        avatar_url: 'https://i.pravatar.cc/150?img=12',
        comment:
          'The comprehensive curriculum and real-world case studies made complex ESG concepts easy to understand. I now confidently present sustainability strategies to our board of directors.',
        order: 2,
      },
      {
        name: 'Amira Hassan',
        avatar_url: 'https://i.pravatar.cc/150?img=45',
        comment:
          'Best investment in my professional development. The certificate opened doors to new opportunities, and the alumni network has been invaluable for ongoing learning and collaboration.',
        order: 3,
      },
    ],
    faqs: [
      {
        question: 'Do I need prior experience in sustainability to join this academy?',
        answer:
          'No prior experience is required. The program is designed for professionals from all backgrounds who want to build ESG expertise. We start with fundamentals and progressively build to advanced topics.',
        order: 1,
      },
      {
        question: 'What is the time commitment for this program?',
        answer:
          'The program requires approximately 8-10 hours per week over 10 weeks. This includes live sessions (2 hours twice weekly), self-paced learning, assignments, and group projects.',
        order: 2,
      },
      {
        question: 'Will I receive a certificate upon completion?',
        answer:
          'Yes! Upon successful completion of all modules and the final project, you will receive a professional certificate recognized by industry leaders globally.',
        order: 3,
      },
      {
        question: 'Can I access course materials after the program ends?',
        answer:
          'Absolutely! You will have lifetime access to all course materials, recordings, templates, and resources. You will also receive updates as ESG standards evolve.',
        order: 4,
      },
      {
        question: 'Is financial assistance available?',
        answer:
          'Yes, we offer early bird discounts, installment plans, and scholarship opportunities for qualified candidates. Contact our admissions team to discuss your options.',
        order: 5,
      },
      {
        question: 'What career opportunities are available after completing this academy?',
        answer:
          'Graduates pursue roles such as ESG Analyst, Sustainability Manager, CSR Director, Impact Investment Analyst, and Corporate Governance Specialist across various industries.',
        order: 6,
      },
    ],
  },
  // Second Academy - Full Stack Web Development
  {
    title: 'Full Stack Web Development Bootcamp',
    slug: 'fullstack-web-development',
    description: `Launch your career as a professional full stack web developer with our comprehensive, industry-aligned bootcamp that transforms beginners into job-ready developers. In today's digital economy, full stack developers are among the most sought-after professionals, commanding competitive salaries and enjoying diverse career opportunities across startups, tech giants, and enterprises. This intensive 12-week program takes you from foundational concepts to advanced professional skills, covering both frontend and backend technologies used by leading tech companies worldwide including Google, Facebook, Netflix, and Airbnb.

Our curriculum is meticulously designed to mirror real-world development workflows and industry best practices. You'll start with HTML5, CSS3, and modern JavaScript (ES6+) fundamentals before diving into popular frontend frameworks like React and Vue.js. You'll master component-based architecture, state management with Redux and Vuex, routing, hooks, and performance optimization techniques. On the backend, you'll become proficient in Node.js and Express framework, learning to build RESTful APIs, implement authentication and authorization, handle file uploads, and manage sessions. You'll work with both SQL databases (PostgreSQL) and NoSQL databases (MongoDB), understanding when to use each and how to design efficient schemas and optimize queries for performance.

What sets our bootcamp apart is the relentless emphasis on building real projects from day one. You'll create a portfolio of 8+ production-ready applications including e-commerce platforms with payment integration, social media applications with real-time features, task management systems with collaborative features, real-time chat applications using WebSockets, blog platforms with content management, and API-driven mobile-responsive web apps. Each project incorporates industry best practices for code quality, testing (unit tests, integration tests, end-to-end tests), security (OWASP guidelines, input validation, SQL injection prevention), performance optimization (lazy loading, code splitting, caching strategies), and accessibility (WCAG compliance).

You'll also participate in pair programming sessions that simulate professional team collaboration, code reviews that teach you to give and receive constructive feedback, and agile development sprints with daily standups, sprint planning, and retrospectives. You'll learn essential DevOps practices including version control with Git and GitHub (branching strategies, pull requests, merge conflicts), continuous integration and deployment (CI/CD pipelines), containerization with Docker, and cloud deployment on platforms like AWS, Vercel, Netlify, and Heroku. The curriculum also covers modern development tools including VS Code, Chrome DevTools, Postman for API testing, and monitoring tools for production applications.

Our instructors are experienced software engineers from companies like Google, Microsoft, Amazon, and leading startups who bring practical insights on technical interviews, system design, debugging strategies, and career advancement. They'll teach you not just how to code, but how to think like a professional developer, solve complex problems, and continuously learn new technologies. You'll receive personalized mentorship, resume reviews, portfolio optimization, mock technical interviews, and interview preparation covering data structures, algorithms, and system design. Our dedicated career services team has partnerships with over 100 hiring companies actively seeking our graduates, and we provide ongoing support until you land your first developer role.

The bootcamp includes lifetime access to all course materials, ongoing curriculum updates as technologies evolve, and membership in our thriving alumni community of over 2,000 developers worldwide. You'll also get access to exclusive job opportunities, continued learning resources, and networking events. Whether you're transitioning careers from a non-technical background, upskilling from a related field, or starting fresh in technology, this program provides the comprehensive training, hands-on experience, and career support you need to succeed as a full stack developer. Join thousands of successful graduates who have transformed their careers and are now building amazing products at companies around the world.`,
    duration: '12 weeks',
    format: 'Online Live + Hands-on Projects',
    category: 'Technology',
    image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    certificate: true,
    portfolio: true,
    status: 'ACTIVE',
    pricing: [
      {
        name: 'Full Payment',
        original_price: 8000000,
        discount_price: 6500000,
        order: 1,
      },
      {
        name: 'Monthly Installment',
        original_price: 9000000,
        discount_price: 7500000,
        order: 2,
      },
    ],
    features: [
      {
        title: 'Complete Frontend & Backend Training',
        description: 'Master React, Vue.js, Node.js, Express, and database technologies',
        icon: 'code',
        order: 1,
      },
      {
        title: '8+ Portfolio Projects',
        description: 'Build production-ready applications for your professional portfolio',
        icon: 'folder',
        order: 2,
      },
      {
        title: 'Live Coding Sessions',
        description: 'Interactive workshops with experienced software engineers',
        icon: 'video',
        order: 3,
      },
      {
        title: 'Career Support & Job Placement',
        description: 'Resume reviews, interview prep, and connections to hiring partners',
        icon: 'briefcase',
        order: 4,
      },
      {
        title: 'Lifetime Learning Access',
        description: 'Unlimited access to materials, updates, and new content',
        icon: 'infinity',
        order: 5,
      },
      {
        title: 'Mentorship & Code Reviews',
        description: 'Personalized feedback from industry professionals',
        icon: 'user-check',
        order: 6,
      },
      {
        title: 'DevOps & Cloud Deployment',
        description: 'Learn Docker, CI/CD, AWS, and modern deployment practices',
        icon: 'cloud',
        order: 7,
      },
    ],
    themes: [
      {
        title: 'Frontend Development Mastery',
        description: 'Building modern, responsive user interfaces with React and Vue.js',
        order: 1,
        topics: [
          {
            title: 'HTML, CSS & JavaScript Fundamentals',
            description: 'Core web technologies and modern ES6+ JavaScript',
            order: 1,
          },
          {
            title: 'React.js & Component Architecture',
            description: 'Building scalable applications with React hooks and state management',
            order: 2,
          },
          {
            title: 'Vue.js & Nuxt Framework',
            description: 'Creating dynamic UIs with Vue composition API and Nuxt',
            order: 3,
          },
          {
            title: 'Responsive Design & CSS Frameworks',
            description: 'Tailwind CSS, mobile-first design, and accessibility',
            order: 4,
          },
        ],
      },
      {
        title: 'Backend Development & APIs',
        description: 'Server-side programming, databases, and RESTful API design',
        order: 2,
        topics: [
          {
            title: 'Node.js & Express Framework',
            description: 'Building robust backend services and middleware',
            order: 1,
          },
          {
            title: 'Database Design & SQL',
            description: 'PostgreSQL, data modeling, and query optimization',
            order: 2,
          },
          {
            title: 'RESTful API Development',
            description: 'API design patterns, authentication, and documentation',
            order: 3,
          },
          {
            title: 'NoSQL & MongoDB',
            description: 'Document databases and schema design for flexibility',
            order: 4,
          },
        ],
      },
      {
        title: 'DevOps & Professional Practices',
        description: 'Version control, testing, deployment, and team collaboration',
        order: 3,
        topics: [
          {
            title: 'Git & GitHub Workflows',
            description: 'Version control, branching strategies, and collaboration',
            order: 1,
          },
          {
            title: 'Testing & Quality Assurance',
            description: 'Unit testing, integration testing, and test-driven development',
            order: 2,
          },
          {
            title: 'Docker & Containerization',
            description: 'Creating portable applications with Docker containers',
            order: 3,
          },
          {
            title: 'Cloud Deployment & CI/CD',
            description: 'Deploying to AWS, Vercel, and automated pipelines',
            order: 4,
          },
        ],
      },
    ],
    instructors: [
      {
        name: 'Alex Thompson',
        job_title: 'Senior Software Engineer, Tech Unicorn',
        avatar_url: 'https://i.pravatar.cc/150?img=33',
        description:
          'Alex has 10+ years building scalable web applications at startups and Fortune 500 companies. He specializes in React, Node.js, and cloud architecture.',
        order: 1,
      },
      {
        name: 'Priya Sharma',
        job_title: 'Lead Frontend Developer, E-commerce Giant',
        avatar_url: 'https://i.pravatar.cc/150?img=38',
        description:
          'Priya leads frontend teams building high-traffic consumer applications. She is passionate about performance optimization and user experience design.',
        order: 2,
      },
    ],
    testimonials: [
      {
        name: 'Budi Santoso',
        avatar_url: 'https://i.pravatar.cc/150?img=15',
        comment:
          'I went from zero coding experience to landing a developer job in 4 months! The hands-on projects and mentorship were game-changers. Highly recommend this bootcamp!',
        order: 1,
      },
      {
        name: 'Lisa Wang',
        avatar_url: 'https://i.pravatar.cc/150?img=44',
        comment:
          'The curriculum is incredibly comprehensive and up-to-date. I learned more in 12 weeks than I did in 2 years of self-study. The career support helped me negotiate a great salary.',
        order: 2,
      },
      {
        name: 'Ahmed Ibrahim',
        avatar_url: 'https://i.pravatar.cc/150?img=51',
        comment:
          'Best decision I ever made! The instructors are patient, knowledgeable, and genuinely care about your success. My portfolio projects impressed every interviewer.',
        order: 3,
      },
    ],
    faqs: [
      {
        question: 'Do I need any programming experience to join?',
        answer:
          'No prior experience is required! We start from the basics and build up progressively. However, strong problem-solving skills and dedication to learning are essential.',
        order: 1,
      },
      {
        question: 'How much time should I dedicate each week?',
        answer:
          'Plan for 40-50 hours per week including live sessions, self-paced learning, and project work. This is an intensive bootcamp designed to prepare you for professional roles quickly.',
        order: 2,
      },
      {
        question: 'What kind of jobs can I get after completing the bootcamp?',
        answer:
          'Graduates typically pursue roles like Junior Full Stack Developer, Frontend Developer, Backend Developer, or Software Engineer with starting salaries ranging from IDR 8-15 million per month.',
        order: 3,
      },
      {
        question: 'Do you provide job placement assistance?',
        answer:
          'Yes! We offer resume reviews, mock interviews, portfolio optimization, and introductions to our 100+ hiring partners. While we cannot guarantee placement, 85% of graduates find jobs within 6 months.',
        order: 4,
      },
      {
        question: 'What technologies will I learn?',
        answer:
          'You will learn HTML, CSS, JavaScript, React, Vue.js, Node.js, Express, PostgreSQL, MongoDB, Git, Docker, AWS, and more. The curriculum is regularly updated to reflect industry trends.',
        order: 5,
      },
    ],
  },
  // Third Academy - Data Science & Machine Learning
  {
    title: 'Data Science & Machine Learning Professional',
    slug: 'data-science-machine-learning',
    description: `Become a highly skilled data science professional and unlock the transformative power of artificial intelligence, machine learning, and advanced analytics. In the age of big data and AI-driven decision making, organizations across every industry—from healthcare and finance to e-commerce and manufacturing—are desperately seeking skilled data scientists who can extract actionable insights from complex datasets, build accurate predictive models, and drive data-informed strategic decisions. This comprehensive 14-week program equips you with the technical skills, statistical knowledge, business acumen, and practical experience needed to excel in this high-demand, high-impact field.

Our curriculum covers the complete end-to-end data science workflow from data collection and cleaning to advanced machine learning model development and production deployment. You'll master Python programming with a focus on data science applications, statistical analysis and hypothesis testing, probability theory, and data visualization principles. You'll become proficient with essential libraries and frameworks including NumPy for numerical computing, Pandas for data manipulation and analysis, Matplotlib and Seaborn for visualization, Scikit-learn for traditional machine learning, TensorFlow and PyTorch for deep learning, and NLTK and spaCy for natural language processing. The program includes comprehensive coverage of supervised learning algorithms (linear regression, logistic regression, decision trees, random forests, gradient boosting, support vector machines), unsupervised learning techniques (k-means clustering, hierarchical clustering, DBSCAN, principal component analysis), and advanced deep learning architectures (convolutional neural networks for computer vision, recurrent neural networks and transformers for sequential data, generative adversarial networks, and reinforcement learning fundamentals).

What makes this program unique is the intense focus on real-world applications and measurable business impact. You'll work on industry-relevant projects involving customer churn prediction for subscription businesses, recommendation systems for e-commerce platforms, fraud detection for financial services, sentiment analysis for social media monitoring, image classification for quality control, time series forecasting for demand planning, and natural language processing for document analysis. Each project teaches you to frame ambiguous business problems as well-defined data science questions, perform exploratory data analysis to understand patterns, select appropriate algorithms based on problem characteristics, engineer features that improve model performance, evaluate models using appropriate metrics, and communicate findings effectively to both technical and non-technical stakeholders including executives and business leaders.

Our instructors are practicing data scientists, machine learning engineers, and AI researchers from leading tech companies, consulting firms, and research institutions. They bring cutting-edge knowledge of the latest algorithms, tools, and industry best practices. You'll learn not just the theory behind algorithms but also crucial practical skills including feature engineering techniques, hyperparameter tuning strategies, handling imbalanced datasets, dealing with missing data, detecting and mitigating bias in models, interpreting complex models, and deploying models to production using cloud platforms and modern MLOps practices. The curriculum also covers big data technologies like Apache Spark for distributed computing, cloud platforms including AWS SageMaker and Google Cloud AI Platform, and modern data science tools like Jupyter notebooks for interactive development, Git for version control, Docker for containerization, and MLflow for experiment tracking.

You'll also develop crucial soft skills that distinguish exceptional data scientists including data storytelling techniques, visualization design principles, presenting insights to executives, translating business requirements into technical specifications, and collaborating effectively with cross-functional teams. The program includes a comprehensive capstone project where you'll tackle a complex real-world problem from start to finish, demonstrating your ability to deliver end-to-end data science solutions. Upon completion, you'll have a portfolio of impressive projects showcasing your capabilities, a professional certificate recognized by employers worldwide, and access to our alumni network of data professionals. Our career services include resume optimization, interview preparation covering statistics, machine learning, coding, and case studies, and connections to hiring partners. Join the data revolution and transform your career in this exciting, rapidly growing field.`,
    duration: '14 weeks',
    format: 'Hybrid: Live Sessions + Project-Based',
    category: 'Data Science',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    certificate: true,
    portfolio: true,
    status: 'ACTIVE',
    pricing: [
      {
        name: 'Early Registration',
        original_price: 9000000,
        discount_price: 7000000,
        order: 1,
      },
      {
        name: 'Standard',
        original_price: 9000000,
        discount_price: 8000000,
        order: 2,
      },
      {
        name: 'Flexible Payment',
        original_price: 10000000,
        discount_price: 9000000,
        order: 3,
      },
    ],
    features: [
      {
        title: 'Complete Python & Statistics Training',
        description: 'Master Python, NumPy, Pandas, and statistical analysis fundamentals',
        icon: 'chart-bar',
        order: 1,
      },
      {
        title: 'Machine Learning Algorithms',
        description: 'Learn supervised, unsupervised, and deep learning techniques',
        icon: 'cpu',
        order: 2,
      },
      {
        title: 'Real Industry Projects',
        description: 'Build 6+ end-to-end data science projects for your portfolio',
        icon: 'database',
        order: 3,
      },
      {
        title: 'Big Data & Cloud Technologies',
        description: 'Work with Apache Spark, AWS, and Google Cloud Platform',
        icon: 'server',
        order: 4,
      },
      {
        title: 'Model Deployment & MLOps',
        description: 'Deploy models to production with Docker and cloud services',
        icon: 'rocket',
        order: 5,
      },
      {
        title: 'Career Coaching & Networking',
        description: 'Interview preparation and connections to hiring companies',
        icon: 'users',
        order: 6,
      },
    ],
    themes: [
      {
        title: 'Python & Data Analysis Foundations',
        description: 'Programming fundamentals and exploratory data analysis',
        order: 1,
        topics: [
          {
            title: 'Python Programming Essentials',
            description: 'Core Python concepts, data structures, and functions',
            order: 1,
          },
          {
            title: 'NumPy & Pandas for Data Manipulation',
            description: 'Working with arrays, dataframes, and data cleaning',
            order: 2,
          },
          {
            title: 'Statistical Analysis & Probability',
            description: 'Descriptive statistics, hypothesis testing, and distributions',
            order: 3,
          },
          {
            title: 'Data Visualization with Matplotlib & Seaborn',
            description: 'Creating compelling charts and visual narratives',
            order: 4,
          },
        ],
      },
      {
        title: 'Machine Learning & AI',
        description: 'Building predictive models and intelligent systems',
        order: 2,
        topics: [
          {
            title: 'Supervised Learning Algorithms',
            description: 'Linear regression, decision trees, random forests, and gradient boosting',
            order: 1,
          },
          {
            title: 'Unsupervised Learning & Clustering',
            description: 'K-means, hierarchical clustering, and dimensionality reduction',
            order: 2,
          },
          {
            title: 'Deep Learning & Neural Networks',
            description: 'TensorFlow, Keras, CNNs, RNNs, and transfer learning',
            order: 3,
          },
          {
            title: 'Natural Language Processing',
            description: 'Text analysis, sentiment analysis, and language models',
            order: 4,
          },
        ],
      },
      {
        title: 'Production ML & Big Data',
        description: 'Scaling models and working with large datasets',
        order: 3,
        topics: [
          {
            title: 'Feature Engineering & Model Optimization',
            description: 'Creating features, hyperparameter tuning, and cross-validation',
            order: 1,
          },
          {
            title: 'Big Data with Apache Spark',
            description: 'Processing large datasets with distributed computing',
            order: 2,
          },
          {
            title: 'MLOps & Model Deployment',
            description: 'Deploying models with Docker, Flask, and cloud platforms',
            order: 3,
          },
          {
            title: 'Data Ethics & Responsible AI',
            description: 'Bias detection, fairness, and ethical considerations',
            order: 4,
          },
        ],
      },
    ],
    instructors: [
      {
        name: 'Dr. Rajesh Kumar',
        job_title: 'Lead Data Scientist, AI Research Lab',
        avatar_url: 'https://i.pravatar.cc/150?img=14',
        description:
          'Dr. Kumar holds a PhD in Machine Learning and has published 20+ research papers. He has built ML systems serving millions of users at top tech companies.',
        order: 1,
      },
      {
        name: 'Emily Zhang',
        job_title: 'Senior ML Engineer, Fintech Unicorn',
        avatar_url: 'https://i.pravatar.cc/150?img=41',
        description:
          'Emily specializes in deploying production ML systems for fraud detection and risk modeling. She is an expert in MLOps and scalable data pipelines.',
        order: 2,
      },
      {
        name: 'Carlos Mendez',
        job_title: 'Data Science Manager, E-commerce Platform',
        avatar_url: 'https://i.pravatar.cc/150?img=8',
        description:
          'Carlos leads data science teams building recommendation systems and personalization engines. He has 12+ years of experience in analytics and ML.',
        order: 3,
      },
    ],
    testimonials: [
      {
        name: 'Siti Nurhaliza',
        avatar_url: 'https://i.pravatar.cc/150?img=36',
        comment:
          'This program completely changed my career trajectory. I transitioned from business analyst to data scientist and doubled my salary. The hands-on projects were invaluable!',
        order: 1,
      },
      {
        name: 'Kevin Wijaya',
        avatar_url: 'https://i.pravatar.cc/150?img=52',
        comment:
          'The instructors are phenomenal! They explain complex ML concepts clearly and provide real-world context. I now confidently build and deploy models at my company.',
        order: 2,
      },
      {
        name: 'Fatima Al-Rashid',
        avatar_url: 'https://i.pravatar.cc/150?img=29',
        comment:
          'Best data science program I have encountered. The curriculum is comprehensive, up-to-date, and practical. The career support helped me land my dream job at a tech giant.',
        order: 3,
      },
    ],
    faqs: [
      {
        question: 'What programming background do I need?',
        answer:
          'Basic programming knowledge is helpful but not required. We teach Python from scratch. However, strong analytical skills and comfort with mathematics are important.',
        order: 1,
      },
      {
        question: 'What math skills are required?',
        answer:
          'You should be comfortable with high school level algebra and basic statistics. We cover the necessary mathematical concepts as part of the curriculum.',
        order: 2,
      },
      {
        question: 'What is the time commitment?',
        answer:
          'Expect to dedicate 30-40 hours per week including live sessions (3x per week), self-paced learning, assignments, and project work over 14 weeks.',
        order: 3,
      },
      {
        question: 'Will I learn deep learning and AI?',
        answer:
          'Yes! The curriculum includes comprehensive coverage of neural networks, CNNs, RNNs, NLP, and computer vision using TensorFlow and PyTorch.',
        order: 4,
      },
      {
        question: 'What career opportunities are available?',
        answer:
          'Graduates pursue roles like Data Scientist, ML Engineer, Data Analyst, AI Researcher, and Business Intelligence Analyst with salaries ranging from IDR 12-25 million per month.',
        order: 5,
      },
      {
        question: 'Do I get access to computing resources?',
        answer: 'Yes! We provide cloud computing credits for AWS and Google Cloud, plus access to GPU resources for training deep learning models.',
        order: 6,
      },
    ],
  },
];
