import i18n from "i18next"
import { initReactI18next } from "react-i18next"

// Define the resources directly in the file to avoid import issues
const resources = {
  en: {
    common: {
      nav: {
        home: "Home",
        programs: "Study Abroad",
        studyChina: "Study in China",
        about: "About EdGoing",
        blog: "Blog",
        contact: "Start Project",
      },
      program: {
        projectType: "Project Type",
        academicFocus: "Academic Focus",
        city: "City",
        gradeLevel: "Grade Level",
        sessions: "Sessions",
        deadline: "Deadline",
        innovation: "Innovation Research",
      },
      countries: {
        singapore: "Singapore",
        usa: "United States",
        uk: "United Kingdom",
        canada: "Canada",
      },
      grades: {
        middleSchool: "Middle School",
        highSchool: "High School",
        university: "University",
      },
      breadcrumb: {
        learn: "Learn",
        observe: "Observe",
        create: "Create",
        think: "Think",
      },
      studyChina: {
        hero: {
          title: "Study in China: Top Universities, Corporate Visits, Cultural Experiences",
          description: "Embark on a learning journey that blends tradition with innovation in this ancient yet modern land of China. Witness your growth and learning in this land where past meets present, and experience the profound heritage of Chinese culture."
        },
        features: {
          title: "Study in China, Win the Future",
          subtitle: "Explore the unique advantages of studying in China and lay the foundation for your future.",
          immersiveLanguage: {
            title: "Immersive Language Learning",
            description: "Enhance language skills in an authentic Chinese environment with systematic language teaching combined with practical life experience by experienced teachers."
          },
          topAcademic: {
            title: "Top Academic Resources",
            description: "Access academic resources from top universities like Tsinghua and Peking University, and engage with cutting-edge Chinese research and academic achievements."
          },
          culturalExperience: {
            title: "Deep Cultural Experience",
            description: "From the Forbidden City to the Great Wall, from tea ceremony to calligraphy, experience Chinese culture comprehensively through traditional cultural workshops like calligraphy and martial arts."
          },
          businessOpportunity: {
            title: "Business Practice Opportunities",
            description: "Visit leading Chinese companies and understand Chinese business models and innovative technology development."
          }
        }
      },
      tabs: {
        highlights: "Highlights",
        academics: "Academics",
        itinerary: "Itinerary",
        admission: "Admission",
      },
      programDetail: {
        projectType: "Project Type",
        duration: "Duration",
        city: "City",
        gradeLevel: "Grade Level",
        sessions: "Sessions",
        deadline: "Deadline",
        projectIntroduction: "Project Introduction",

        week1Title: "Week 1: Cultural Exploration",
        week2Title: "Week 2: Innovation Practice",
        defaultHighlights: {
          highlight1: "Deep experience of the perfect fusion of Chinese traditional culture and modern innovation",
          highlight2: "Visit renowned companies to understand China's digital economy development model",
          highlight3: "Exchange with local students to enhance cross-cultural communication skills",
          highlight4: "Professional mentor guidance and academic certification",
          highlight5: "Immersive language environment to rapidly improve Chinese proficiency"
        },
        defaultAcademics: {
          academic1: "History and current analysis of China's economic development",
          academic2: "Digital transformation and innovation case studies",
          academic3: "Chinese cultural heritage and modernization process",
          academic4: "Cross-cultural business communication skills",
          academic5: "Project management and team collaboration"
        },
        defaultItinerary: {
          week1: {
            item1: "City cultural attractions visit",
            item2: "Traditional craft experience workshop",
            item3: "Local university campus visit",
            item4: "Cultural exchange activities"
          },
          week2: {
            item1: "Technology company visits",
            item2: "Innovation project practice",
            item3: "Industry expert lectures",
            item4: "Results presentation and summary"
          }
        },
        defaultRequirements: {
          requirement1: "Age: 16-25 years old",
          requirement2: "Education: High school or above",
          requirement3: "Language: Basic Chinese communication skills",
          requirement4: "Healthy and adaptable to group living"
        }
      },
      sections: {
        projectHighlights: "Project Highlights",
        academicContent: "Academic Content",
        itinerary: "Itinerary",
        admissionRequirements: "Admission Requirements",
      },
      academics: {
        intro:
          "This program combines theoretical learning with practical experience, covering the following academic modules:",
      },
      itinerary: {
        week1: "Week 1: Foundation Learning",
        week2: "Week 2: Advanced Practice",
      },
      admission: {
        basicRequirements: "Basic Requirements",
        applicationMaterials: "Application Materials",
      },
      image: "Image",
      hero: {
        explore: "Explore",
        learn: "Learn",
        grow: "Grow",
        subtitle: "Every EdGoing program is a carefully crafted adventure, designed to go beyond sightseeing—challenging assumptions, building empathy, and empowering Participants to see the world, and themselves, in new ways. Through these transformative experiences, we open minds, build bridges, and create memories that last a lifetime.",
      },
      banner: {
        summer2025: {
          title: "2025 Summer Study Tour",
          subtitle: "Deep-dive programs in 20+ global universities",
          cta: "Learn More",
        },
        ukElite: {
          title: "UK Elite University Tour",
          subtitle: "Explore Oxford, Cambridge and more",
          cta: "Discover Now",
        },
        japanTech: {
          title: "Japan Tech Innovation Tour",
          subtitle: "Where cutting-edge meets tradition",
          cta: "Join the Innovation",
        },
        leadership: {
          title: "Global Leadership Summit",
          subtitle: "Empowering the next generation of world leaders",
          cta: "Be a Leader",
        },
        sustainable: {
          title: "Sustainable Future Program",
          subtitle: "Learn to shape a greener tomorrow",
          cta: "Go Green",
        },
      },
      whyChoose: {
        title: "Student Support and Safety",
        subtitle:
          "We prioritize your health and safety first, providing comprehensive support services throughout your educational journey.",
        leadership: {
          title: "Experienced Leadership Team",
          description:
            "Our experienced team provides professional guidance and comprehensive support throughout your journey.",
        },
        education: {
          title: "High-Quality Education Programs",
          description:
            "Carefully designed programs with top partner institutions to provide excellent educational experiences.",
        },
        accommodation: {
          title: "Safe Accommodation and Healthy Dining",
          description: "Safe living environments and nutritious meals to ensure your health and well-being.",
        },
        support247: {
          title: "24/7 Support",
          description: "Round-the-clock support services to provide continuous assistance for students.",
        },
        cultural: {
          title: "Immersive Cultural Experience",
          description: "Interactive activities and rich travel experiences to promote deep cultural learning.",
        },
        academic: {
          title: "Recognized Academic Excellence",
          description: "Courses recognized by top universities, enhancing your academic credentials.",
        },
      },
      whyChooseEdGoing: {
        title: "Why Choose",
        subtitle: "Inspiring global thinking through transformative, safe and personalized journeys, trusted worldwide",
        features: {
          expertise: {
            title: "Professional Knowledge & Experience",
            description: "EdGoing is rooted in global expertise, committed to rigorous research, and carefully crafts the highest quality, transformative educational programs that inspire students to learn beyond the classroom.",
          },
          globalVision: {
            title: "Global Vision",
            description: "Through strategic global partnerships, EdGoing creates authentic cultural exchanges, enabling students to become well-informed, empathetic future leaders with a global perspective.",
          },
          safety: {
            title: "Safety & Personalization Commitment",
            description: "EdGoing designs safe, high-quality and personalized journeys to help students master lifelong skills and gain transformative global perspectives.",
          },
        },
      },
      testimonials: {
        title: "Student Stories",
        subtitle: "Listen to our students share their learning experiences and growth stories.",
        items: {
          student1: {
            content: "My study tour experience in Singapore was amazing. Not only did I learn a lot of scientific knowledge, but I also experienced different cultures. The teachers were very professional and the courses were designed to be very interesting, which made me more interested in science. This trip really changed my view of the world.",
            author: "Zhang Wenhui",
            role: "High School Student",
            program: "Singapore Science Camp",
          },
          parent1: {
            content: "Participating in EdGoing's program made my child more confident and independent. She not only improved her English level, but also learned how to get along with classmates from different cultural backgrounds. This was a very worthwhile investment.",
            author: "Li Ming",
            role: "Parent",
            program: "International Cultural Exchange Program",
          },
          student2: {
            content: "Through EdGoing's STEM program, I developed a strong interest in programming and robotics. The mentors were very professional and the teaching methods were very interesting, allowing me to learn a lot while playing.",
            author: "Wang Xiaoming",
            role: "Middle School Student",
            program: "STEM Innovation Camp",
          },
        },
      },
      newsletter: {
        title: "Subscribe to Our Latest News",
        subtitle: "Subscribe to our learning newsletter to get learning resources and content, and receive special offers.",
        placeholder: "Enter your email address",
        button: "Subscribe",
      },
      cta: {
        title: "Ready to Start Your Journey?",
        subtitle: "Take the first step in your international education adventure. Our team is ready to help you plan the perfect program.",
        button: "Start Consultation",
      },
      about: {
        hero: {
          title: "About EdGoing",
          subtitle: "Empowering International Educational Cultural Exchange"
        },
        story: {
          title: "Our Story",
          paragraph1: "EdGoing was founded on a belief: education should be an immersive experience, not just a lesson in the classroom. With years of experience at leading global educational travel companies, we have witnessed firsthand how travel can transform students' growth journeys by expanding their horizons and inspiring their hearts.",
          paragraph2: "Inspired by this, we founded EdGoing to provide unique educational travel experiences for students from China and around the world. We focus on partnering with top universities globally, offering high-quality courses covering artificial intelligence, technology, humanities, and other fields, bringing truly transformative learning experiences to students.",
          paragraph3: "We are committed to building cultural bridges and creating programs that inspire discovery, cultivating the next generation of leaders, thinkers, and global citizens."
        },
        mission: {
          title: "Our Mission"
        },
        values: {
          title: "Our Core Values",
          subtitle: "The principles that guide all our actions",
          curiosity: {
            title: "Curiosity",
            description: "We believe in maintaining the habit of learning through exploration, encouraging students to explore, ask questions, and discover new perspectives"
          },
          culturalBridge: {
            title: "Cultural Bridge",
            description: "We are committed to building cultural bridges, promoting understanding, and helping students connect with diverse global communities"
          },
          excellence: {
            title: "Excellence",
            description: "We pursue the highest standards in all our work, from course quality to student experience"
          },
          innovation: {
            title: "Innovation",
            description: "We embrace innovative thinking and creativity, constantly seeking to improve our programs to maintain leadership in the education field"
          },
          integrity: {
            title: "Integrity",
            description: "We act with honesty and transparency, ensuring our program goals always serve students' best interests under any circumstances"
          },
          globalCitizenship: {
            title: "Global Citizenship",
            description: "We are committed to cultivating responsible, empathetic leaders who make positive contributions to the global community"
          }
        }
      },
      blog: {
        hero: {
          title: "Our Blog",
          description: "Discover insights, stories, and tips from our global education experiences. Stay updated with the latest trends in international education and cultural exchange."
        }
      },
      contact: {
        hero: {
          title: "Start Your Planning",
          description: "Ready to begin your educational journey? Let us help you create the perfect study abroad experience."
        },
        form: {
          intro: {
            line1: "Need help with assistance, or just have a question for us?",
            line2: "Fill out our form and we'll respond within 2 business days.",
            line3: "Or Call Us @"
          },
          fields: {
            privacyConsent: "I have read and agree to the",
            privacyPolicy: "Privacy Policy",
            role: {
              label: "Your Role*",
              placeholder: "Select your role",
              student: "Student",
              parent: "Parent",
              teacher: "Teacher",
              administrator: "School Administrator",
              consultant: "Educational Consultant",
              other: "Other"
            },
            schoolName: "School Name",
            firstName: "First Name*",
            lastName: "Last Name*",
            email: "Email Address*",
            phone: "Phone Number*",
            grade: "Grade/Education Level*",
            province: "Province/State",
            city: "City",
            destinations: "Preferred Destinations (Multiple)",
            learningInterests: "Learning Interests*",
            message: "Message",
            consent: "I agree to receive program information and updates from EdGoing",
            submit: "Submit Application",
            submitting: "Submitting..."
          },
          placeholders: {
            firstName: "Enter your first name",
            lastName: "Enter your last name",
            email: "Enter your email address",
            phone: "Enter your phone number",
            schoolName: "Enter your school name",
            grade: "Select your grade/education level",
            province: "Select your province/state",
            city: "Select your city",
            message: "Tell us about your needs and questions..."
          }
        }
      },
      footer: {
        navigation: "NAVIGATION",
        contactUs: "CONTACT US",
        followUs: "FOLLOW US",
        nav: {
          home: "Home",
          worldStudy: "Study Abroad",
          chinaStudy: "Study in China",
          blog: "Blog",
          about: "About EdGoing",
          faq: "FAQ",
          contact: "Start Project",
        },
        callUs: "Call Us",
        email: "Email",
        address: "Address",
        locations: "Shanghai | Singapore",
        shanghai: "Shanghai",
        shanghaiAddress: "18F, Tower B, 838 South Huangpi Road",
        shanghaiDistrict: "Huangpu District, Shanghai, 200025",
        singapore: "Singapore",
        singaporeAddress: "9 Kelantan Lane #06-01",
        singaporePostal: "Singapore 208628",
        followDescription: "Follow us on social media for updates and educational insights",
        copyright: "2025 EdGoing. All rights reserved.",
      },
      partners: {
        title: "Our Partners",
        subtitle:
          "We have established deep partnerships with top universities and educational institutions worldwide to provide quality educational resources and learning opportunities for our students.",
        universities: "Partner Universities",
        organizations: "Partner Organizations",
        stats: {
          universities: "Partner Universities",
          countries: "Countries Covered",
          programs: "Programs Available",
          students: "Students Benefited",
        },
      },
    },
    programs: {
      singaporeAI: {
        title: "Singapore Innovation Camp & 7-Day Academic Journey",
        description:
          "This is a two-week immersive learning program that combines lectures, corporate visits, cultural workshops, and team projects to explore how Singapore has developed strong digital innovation capabilities from its traditional cultural foundation. The program is designed for global students, combining SMU's fintech and innovation research advantages to provide an immersive innovation practice experience in Singapore's local innovation ecosystem.",
        sessions: {
          session1: "July 1-14, 2025",
          session2: "July 15-28, 2025",
          session3: "August 1-14, 2025",
        },
        deadline: "June 15, 2025",
        highlights: {
          highlight1:
            "Deep experience of the perfect integration of Singapore's traditional culture and modern innovation",
          highlight2: "Visit renowned companies to understand Singapore's digital economy development model",
          highlight3: "Exchange with local students to enhance cross-cultural communication skills",
          highlight4: "Professional mentor guidance and academic certification",
          highlight5: "Immersive language environment to rapidly improve English proficiency",
        },
        academics: {
          academic1: "Artificial Intelligence Fundamentals and Applications",
          academic2: "Data Science and Machine Learning",
          academic3: "Innovation Thinking and Design Thinking",
          academic4: "Cross-cultural Business Communication",
          academic5: "Project Management and Team Collaboration",
        },
        itinerary: {
          item1: "Professional course learning",
          item2: "Campus visits and experiences",
          item3: "Cultural exchange activities",
          item4: "Team building activities",
          item5: "Practical project participation",
          item6: "Expert lectures",
          item7: "Field investigations",
          item8: "Results presentation",
        },
        admission: {
          req1: "Age: 16-25 years old",
          req2: "Education: High school or above",
          req3: "Language: Basic English communication skills",
          req4: "Healthy and adaptable to group living",
          material1: "Application form",
          material2: "Personal statement",
          material3: "Academic transcripts",
          material4: "Recommendation letter (optional)",
          material5: "Passport copy",
        },
      },
      usArt: {
        title: "Youth Art Advanced Program",
        description:
          "You Nic Co collaborates with Mass Audubon to present the Youth Art Advanced Program, perfectly combining art and nature to inspire students' creativity and imagination. Through visits to nature reserves and learning about flora and fauna, students will create art under the guidance of experienced art teachers.",
        sessions: {
          session1: "July 1-14, 2025",
          session2: "July 15-28, 2025",
          session3: "August 1-14, 2025",
        },
        deadline: "June 15, 2025",
        highlights: {
          highlight1: "Instruction by experienced art teachers, cultivating proper painting habits in students",
          highlight2: "Study alongside students from around the world, improving English speaking skills",
          highlight3: "Carefully designed courses to expand students' creativity and imagination",
          highlight4:
            "Visit top art schools across the US, experiencing the artistic atmosphere of prestigious institutions",
          highlight5: "24/7 safety protection, ensuring students' personal safety throughout the course",
        },
        academics: {
          academic1: "Art fundamentals theory and techniques",
          academic2: "Nature observation and sketching skills",
          academic3: "Creative thinking development",
          academic4: "Art history and cultural background",
          academic5: "Portfolio creation guidance",
        },
        itinerary: {
          item1: "Art foundation course learning",
          item2: "Nature reserve visits and sketching",
          item3: "Art museum visits",
          item4: "Exchange with local artists",
          item5: "Creative practice projects",
          item6: "Art school visits",
          item7: "Exhibition preparation",
          item8: "Graduation exhibition",
        },
        admission: {
          req1: "Age: 14-18 years old",
          req2: "Education: Middle school or above",
          req3: "Language: Basic English communication skills",
          req4: "Strong interest in art",
          material1: "Application form",
          material2: "Personal portfolio (optional)",
          material3: "Academic transcripts",
          material4: "Recommendation letter (optional)",
          material5: "Passport copy",
        },
      },
      types: {
        innovation: "Innovation Camp",
        stem: "STEM & Science Innovation",
        academic: "Academic Study",
        cultural: "Cultural Experience",
      },
      admin: {
        testimonials: {
          title: "Student Stories",
          description: "Manage all student stories with image upload and multilingual content. Published stories will automatically sync to the website homepage (top 3 by order).",
          addStory: "Add Student Story",
          editStory: "Edit Student Story",
          createStory: "Create Student Story",
          cancel: "Cancel",
          save: "Save",
          update: "Update",
          create: "Create",
          saving: "Saving...",
          delete: "Delete",
          edit: "Edit",
          confirmDelete: "Are you sure you want to delete this student story?",
          deleteSuccess: "Student story deleted successfully!",
          createSuccess: "Student story created successfully!",
          updateSuccess: "Student story updated successfully!",
          noStories: "No student stories yet. Click 'Add Student Story' above to create the first one.",
          studentName: "Student Name",
          studentRole: "Student Role",
          participatedProgram: "Participated Program",
          storyContent: "Story Content",
          studentPhoto: "Student Photo",
          status: "Status",
          order: "Order",
          published: "Published",
          draft: "Draft",
          required: "Required",
          placeholders: {
            studentName: "Enter student name",
            studentRole: "e.g., High school student, College student, etc.",
            participatedProgram: "Enter program name",
            storyContent: "Enter student's story or testimonial...",
            order: "Lower numbers appear first"
          },
          language: "Language",
          chinese: "Chinese",
          english: "English",
          backToDashboard: "Back to Dashboard",
          backToList: "Back to Student Stories List"
        },
        blogs: {
          title: "Blog Library",
          description: "Manage all blog articles with image upload and multilingual content support.",
          addBlog: "Add Blog",
          editBlog: "Edit Blog",
          createBlog: "Add Blog",
          noBlogs: "No blog articles yet. Click the \"Add Blog\" button above to create your first article",
          featuredImage: "Featured Image",
          status: "Status",
          order: "Order",
          published: "Published",
          draft: "Draft",
          edit: "Edit",
          delete: "Delete",
          cancel: "Cancel",
          saving: "Saving...",
          update: "Update",
          create: "Create",
          backToList: "Back to Blog List",
          language: "Language",
          chinese: "Chinese",
          english: "English",
          backToDashboard: "Back to Dashboard"
        },
        blog: {
          hero: {
            title: "Our Blog",
            description: "Explore insights, stories, and tips from our global education experience. Learn about the latest trends in international education and cultural exchange."
          },
          noBlogs: "No blog articles available",
          readMore: "Read More",
          notFound: "Blog Not Found",
          notFoundDesc: "Sorry, the blog article you are looking for does not exist.",
          defaultDesc: "Insights and tips for your study abroad journey"
        },
        imageUpload: {
          studentPhoto: "Student Photo",
          changePhoto: "Change Photo",
          selectPhoto: "Select Photo",
          dragDropText: "Drag image here, or click to select file",
          uploading: "Uploading...",
          supportedFormats: "Supports JPEG, PNG, GIF, WebP formats, max 5MB",
          invalidFileType: "Only image files are supported (JPEG, PNG, GIF, WebP)",
          fileTooLarge: "File size cannot exceed 5MB",
          uploadFailed: "Upload failed, please try again"
        },
        chinaPrograms: {
          title: "China Study Programs Management",
          description: "Manage all China study programs, including program information, images, and application management.",
          backToDashboard: "Back to Dashboard",
          backToList: "Back to China Programs List",
          addProgram: "Add China Program",
          editProgram: "Edit China Program",
          createProgram: "Create China Program",
          cancel: "Cancel",
          save: "Save",
          update: "Update",
          create: "Create",
          saving: "Saving...",
          delete: "Delete",
          edit: "Edit",
          confirmDelete: "Are you sure you want to delete this China program?",
          confirmUpdate: "Are you sure you want to update this China program?",
          deleteSuccess: "China program deleted successfully!",
          createSuccess: "China program created successfully!",
          updateSuccess: "China program updated successfully!",
          noPrograms: "No China programs yet. Click 'Add China Program' above to create the first one.",
          programTitle: "Program Title",
          programDescription: "Program Description",
          country: "Country",
          city: "City",
          duration: "Duration",
          deadline: "Application Deadline",
          featuredImage: "Featured Image",
          gallery: "Image Gallery",
          type: "Program Type",
          gradeLevel: "Grade Level",
          sessions: "Sessions",
          highlights: "Highlights",
          academics: "Academics",
          itinerary: "Itinerary",
          requirements: "Admission Requirements",
          status: "Status",
          published: "Published",
          draft: "Draft",
          chinese: "Chinese",
          english: "English",
          placeholders: {
            programTitle: "Enter program title",
            programDescription: "Enter program description...",
            country: "Select country",
            city: "Select city",
            selectCountryFirst: "Please select country first",
            duration: "e.g., 2 weeks; 14 days",
            sessions: "e.g., July 10-19, 2025\nAugust 10-19, 2025",
            highlights: "e.g., Visit Huawei and Tencent headquarters\nShenzhen Technology Park field investigation\nExchange with technology professionals",
            academics: "e.g., History of Chinese Technology Development\nArtificial Intelligence Application Cases\n5G Technology Development",
            itinerary: "e.g., Days 1-2: Overview of Shenzhen Technology Development\nDays 3-4: Huawei Visit Experience",
            requirements: "e.g., Age 16-24\nSTEM background preferred\nStrong interest in technology innovation"
          }
        }
      },
    },
  },
  zh: {
    common: {
      nav: {
        home: "首页",
        programs: "游学国际",
        studyChina: "游学中国",
        about: "关于EdGoing",
        blog: "博客",
        contact: "开始项目",
      },
      program: {
        projectType: "项目类型",
        academicFocus: "学术重点",
        city: "城市",
        gradeLevel: "年级",
        sessions: "营期",
        deadline: "截止日期",
        innovation: "创新研究",
      },
      countries: {
        singapore: "新加坡",
        usa: "美国",
        uk: "英国",
        canada: "加拿大",
      },
      grades: {
        middleSchool: "中学",
        highSchool: "高中",
        university: "大学",
      },
      breadcrumb: {
        learn: "学",
        observe: "观",
        create: "创",
        think: "思",
      },
      studyChina: {
        hero: {
          title: "中国游学：名校课堂、企业参访、文化体验",
          description: "在中国这片古老而现代的土地上，开启一段融合传统与创新的学习之旅。目睹你们在这合古今的土地上学习、成长，感受中华文化的深厚底蕴。"
        },
        features: {
          title: "学在中国，赢在未来",
          subtitle: "探索在中国学习的独特优势，为您的未来奠定基础。",
          immersiveLanguage: {
            title: "沉浸式语言学习",
            description: "在真实的中文环境中提升语言能力，由经验丰富的教师系统化语言教学与生活实践相结合的学习体验。"
          },
          topAcademic: {
            title: "顶尖学术资源",
            description: "深度接触清华、北大等顶尖学府的学术资源，接触前沿的中国研究和学术成果。"
          },
          culturalExperience: {
            title: "深度文化体验",
            description: "从故宫到长城，从茶艺到书法，全方位体验中华文化，参与书法、武术等传统文化工坊。"
          },
          businessOpportunity: {
            title: "商业实践机会",
            description: "参访中国领先企业，了解中国商业模式与创新科技发展。"
          }
        }
      },
      tabs: {
        highlights: "亮点",
        academics: "学术",
        itinerary: "行程",
        admission: "申请",
      },
      programDetail: {
        projectType: "项目类型",
        duration: "时长",
        city: "城市",
        gradeLevel: "年级",
        sessions: "营期",
        deadline: "截止日期",
        projectIntroduction: "项目介绍",

        week1Title: "第一周：文化探索",
        week2Title: "第二周：创新实践",
        defaultHighlights: {
          highlight1: "深度体验中国传统文化与现代创新的完美融合",
          highlight2: "参访知名企业，了解中国数字经济发展模式",
          highlight3: "与当地学生交流，提升跨文化沟通能力",
          highlight4: "专业导师指导，获得学术认证",
          highlight5: "沉浸式语言环境，快速提升中文水平"
        },
        defaultAcademics: {
          academic1: "中国经济发展史与现状分析",
          academic2: "数字化转型与创新案例研究",
          academic3: "中华文化传承与现代化进程",
          academic4: "跨文化商务沟通技巧",
          academic5: "项目管理与团队协作"
        },
        defaultItinerary: {
          week1: {
            item1: "城市文化景点参观",
            item2: "传统工艺体验工坊",
            item3: "当地大学校园参访",
            item4: "文化交流活动"
          },
          week2: {
            item1: "科技企业参访",
            item2: "创新项目实践",
            item3: "行业专家讲座",
            item4: "成果展示与总结"
          }
        },
        defaultRequirements: {
          requirement1: "年龄：16-25岁",
          requirement2: "学历：高中在读或以上",
          requirement3: "语言：具备基础中文沟通能力",
          requirement4: "身体健康，适应集体生活"
        }
      },
      sections: {
        projectHighlights: "项目亮点",
        academicContent: "学术内容",
        itinerary: "行程安排",
        admissionRequirements: "申请要求",
      },

      itinerary: {
        week1: "第一周：基础学习",
        week2: "第二周：深度实践",
      },
      admission: {
        basicRequirements: "基本要求",
        applicationMaterials: "申请材料",
      },
      image: "图片",
      hero: {
            explore: "Explore",
    learn: "Learn",
    grow: "Grow",
        exploreFull: "Explore. Learn. Grow.",
        subtitle: "每一个 EdGoing 项目都是精心打造的探险之旅，旨在超越简单的观光——挑战固有观念、培养共情能力，并赋予学员以全新的方式看待世界和自我。",
      },
      banner: {
        summer2025: {
          title: "2025夏季游学计划启动",
          subtitle: "覆盖全球20+名校的深度体验项目",
          cta: "了解更多",
        },
        ukElite: {
          title: "英国顶尖学府深度游学",
          subtitle: "探索牛津剑桥等世界名校",
          cta: "立即探索",
        },
        japanTech: {
          title: "日本科技创新之旅",
          subtitle: "体验前沿科技与传统文化的碰撞",
          cta: "加入创新之旅",
        },
        leadership: {
          title: "全球青年领袖峰会",
          subtitle: "培养下一代全球领袖",
          cta: "成为领袖",
        },
        sustainable: {
          title: "可持续发展未来计划",
          subtitle: "学习塑造更绿色的明天",
          cta: "践行环保",
        },
      },
      whyChoose: {
        title: "学员支持与安全",
        subtitle: "我们优先考虑您的健康，在您的教育旅程中全天候提供全面的支持服务。",
        leadership: {
          title: "经验丰富的领导团队",
          description: "5年以上领导经验，应急处理能力强、清晰的行动指南和1:15的师生比例，提供个性化支持。",
        },
        education: {
          title: "高质量教育项目",
          description: "由专家主导的课程，与顶级合作伙伴合作，提供卓越的教育体验。",
        },
        accommodation: {
          title: "安全住宿和健康餐饮",
          description: "安全的住宿环境，严格的安全措施，以及适合各种饮食需求的营养均衡餐食。",
        },
        support247: {
          title: "全天候支持",
          description: "全天候服务，为学员提供持续支持。",
        },
        cultural: {
          title: "沉浸式文化体验",
          description: "互动活动，融入丰富的游览和当地参与，促进深度学习。",
        },
        academic: {
          title: "受认可的学术卓越",
          description: "旨在提高学术表现和未来大学申请的课程",
        },
      },
      whyChooseEdGoing: {
        title: "为什么选择",
        subtitle: "以变革性、安全和个性化的旅程激发全球思维，获得全球信赖",
        features: {
          expertise: {
            title: "专业知识与经验",
            description: "EdGoing 植根于全球专业知识，致力于严谨的研究，精心打造最高品质、变革性的教育项目，激励学员在课堂之外学习。",
          },
          globalVision: {
            title: "全球视野",
            description: "通过战略性的全球合作伙伴关系，EdGoing 创造了真实的文化交流，使学员成为几乎所有识广、富有同理心且具有全球视野的未来领导者。",
          },
          safety: {
            title: "安全与个性化承诺",
            description: "EdGoing 设计安全、高品质且个性化的旅程，帮助学员掌握终身技能并获得变革性的全球视野。",
          },
        },
      },
      testimonials: {
        title: "学员故事",
        subtitle: "聆听我们的学员分享他们在国外的转变体验。",
        items: {
          student1: {
            content: "我在新加坡的游学经历非常棒，不仅让我学到了很多科学知识，还让我体验了不同的文化。老师们都很专业，课程设计得很有趣，让我对科学产生了更大的兴趣。这次旅行真的改变了我对世界的看法。",
            author: "张文慧",
            role: "高中生",
            program: "新加坡科学营",
          },
          parent1: {
            content: "参加EdGoing的项目让我的孩子变得更加自信和独立。她不仅提高了英语水平，还学会了如何与来自不同文化背景的同学相处。这是一次非常值得的投资。",
            author: "李明",
            role: "学生家长",
            program: "国际文化交流项目",
          },
          student2: {
            content: "通过EdGoing的STEM项目，我对编程和机器人技术产生了浓厚的兴趣。导师们都很专业，教学方式很有趣，让我在玩中学到了很多知识。",
            author: "王小明",
            role: "初中生",
            program: "STEM创新营",
          },
        },
      },
      newsletter: {
        title: "订阅我们的最新消息",
        subtitle: "订阅我们的电子邮件，及时了解最新的项目、旅行机会和教育资讯。",
        placeholder: "输入您的邮箱地址",
        button: "订阅",
      },
      cta: {
        title: "准备开始您的旅程？",
        subtitle: "迈出国际教育冒险的第一步。我们的团队将帮助您找到完美的项目。",
        button: "开始咨询",
      },
      about: {
        hero: {
          title: "关于EdGoing",
          subtitle: "赋能国际教育文化交流"
        },
        story: {
          title: "我们的故事",
          paragraph1: "EdGoing成立于一个信念：教育应该是一次沉浸式的体验，而不仅仅是课堂上的一课。凭借在全球领先的教育旅行公司多年的经验，我们亲眼见证了旅行如何通过拓展学生的视野并激发他们的心，改变他们的成长历程。",
          paragraph2: "受此启发，我们创办了EdGoing，旨在为来自中国和全球的学生提供独特的教育旅行体验。我们专注于与全球顶级大学合作，提供高质量的课程，涵盖人工智能、技术、人文学科等领域，为学生带来真正具有变革性的学习体验。",
          paragraph3: "我们致力于架起文化桥梁，创造能够激发发现的项目，培养下一代领导者、思想家和全球公民。"
        },
        mission: {
          title: "我们的使命"
        },
        values: {
          title: "我们的核心价值观",
          subtitle: "指导我们一切行动的原则",
          curiosity: {
            title: "好奇心",
            description: "我们相信保持学习习惯的探索，鼓励学生探索，提出问题发现新的视角"
          },
          culturalBridge: {
            title: "文化桥梁",
            description: "我们致力于建设文化桥梁，促进理解，并帮助学生与多元化全球社区建立联系"
          },
          excellence: {
            title: "卓越",
            description: "我们追求一切工作的最高标准，从课程质量到学生体验"
          },
          innovation: {
            title: "创新",
            description: "我们拥抱创新思维和创新，不断寻求改进我们的项目，以保持在教育领域的领先地位"
          },
          integrity: {
            title: "诚信",
            description: "我们以诚实和透明的态度行事，确保我们的项目建立在信任和相互尊重的基础上"
          },
          globalCitizenship: {
            title: "全球公民",
            description: "我们致力于培养负责任、有同理心的领导者，为全球社区做出积极贡献"
          }
        }
      },
      blog: {
        hero: {
          title: "我们的博客",
          description: "探索来自我们全球教育经验的见解、故事和技巧。了解国际教育和文化交流的最新趋势。"
        }
      },
      contact: {
        hero: {
          title: "开始您的规划",
          description: "准备开始您的教育之旅？让我们帮助您创造完美的留学体验。"
        },
        form: {
          intro: {
            line1: "需要帮助或有任何问题想咨询我们？",
            line2: "填写我们的表单，我们将在2个工作日内回复您。",
            line3: "或致电联系我们 @"
          },
          fields: {
            privacyConsent: "我已阅读并同意",
            privacyPolicy: "隐私政策",
            role: {
              label: "您的身份*",
              placeholder: "请选择您的身份",
              student: "学生",
              parent: "家长",
              teacher: "教师",
              administrator: "学校管理员",
              consultant: "教育顾问",
              other: "其他"
            },
            schoolName: "学校名称",
            firstName: "名字*",
            lastName: "姓氏*",
            email: "邮箱地址*",
            phone: "联系电话*",
            grade: "年级/学历*",
            province: "省份",
            city: "城市",
            destinations: "意向目的地 (多选)",
            learningInterests: "学习兴趣*",
            message: "留言",
            consent: "我同意接收EdGoing的项目信息和更新",
            submit: "提交申请",
            submitting: "提交中..."
          },
          placeholders: {
            firstName: "请输入您的名字",
            lastName: "请输入您的姓氏",
            email: "请输入您的邮箱地址",
            phone: "请输入您的联系电话",
            schoolName: "请输入您的学校名称",
            grade: "请选择您的年级/学历",
            province: "请选择您的省份",
            city: "请选择您的城市",
            message: "请告诉我们您的需求和问题..."
          }
        }
      },
      footer: {
        navigation: "导航",
        contactUs: "联系我们",
        followUs: "关注我们",
        nav: {
          home: "首页",
          worldStudy: "游学国际",
          chinaStudy: "游学中国",
          blog: "博客",
          about: "关于EdGoing",
          faq: "常见问题",
          contact: "开始项目",
        },
        callUs: "联系电话",
        email: "邮箱",
        address: "地址",
        locations: "上海 | 新加坡",
        shanghai: "上海",
        shanghaiAddress: "上海市黄埔区黄陂南路838号",
        shanghaiDistrict: "中海国际B座18楼",
        singapore: "新加坡",
        singaporeAddress: "9 Kelantan Lane #06-01",
        singaporePostal: "Singapore 208628",
        followDescription: "通过社交媒体关注我们，了解最新动态和教育资讯",
        copyright: "2025 引里信息咨询（上海）有限公司 版权所有",
      },
      partners: {
        title: "合作伙伴",
        subtitle: "与全球顶尖院校和教育机构建立深度合作关系，为学员提供优质的教育资源和学习机会。",
        universities: "合作院校",
        organizations: "合作机构",
        stats: {
          universities: "合作院校",
          countries: "覆盖国家",
          programs: "项目数量",
          students: "受益学员",
        },
      },
    },
    programs: {
      singaporeAI: {
        title: "新加坡创意营理课程暨7天学术之旅",
        description:
          "本项目是一个为期两周的深度体验式学习项目，融合讲座课堂、企业参访、文化工作坊与团队项目，以探索新加坡如何从传统文化根基发展出强劲的数字创新力量。项目面向全球学生，结合SMU的金融科技与创新研究优势，深入新加坡本地创新生态，带来沉浸式的创新实践体验。",
        sessions: {
          session1: "2025年7月1日 - 7月14日",
          session2: "2025年7月15日 - 7月28日",
          session3: "2025年8月1日 - 8月14日",
        },
        deadline: "2025年6月15日",
        highlights: {
          highlight1: "深度体验新加坡传统文化与现代创新的完美融合",
          highlight2: "参访知名企业，了解新加坡数字经济发展模式",
          highlight3: "与当地学生交流，提升跨文化沟通能力",
          highlight4: "专业导师指导，获得学术认证",
          highlight5: "沉浸式语言环境，快速提升英语水平",
        },
        academics: {
          academic1: "人工智能基础理论与应用",
          academic2: "数据科学与机器学习",
          academic3: "创新思维与设计思维",
          academic4: "跨文化商务沟通",
          academic5: "项目管理与团队协作",
        },
        itinerary: {
          item1: "专业课程学习",
          item2: "校园参观与体验",
          item3: "文化交流活动",
          item4: "团队建设活动",
          item5: "实践项目参与",
          item6: "专家讲座",
          item7: "实地考察",
          item8: "成果展示",
        },
        admission: {
          req1: "年龄：16-25岁",
          req2: "学历：高中在读或以上",
          req3: "语言：具备基础英语沟通能力",
          req4: "身体健康，适应集体生活",
          material1: "申请表",
          material2: "个人陈述",
          material3: "学术成绩单",
          material4: "推荐信（可选）",
          material5: "护照复印件",
        },
      },
      usArt: {
        title: "青少年艺术进阶课程",
        description:
          "You Nic Co 与 Mass Audubon 合作推出青少年艺术进阶课程，将艺术与自然完美结合，激发学生的创造力和想象力。通过参观自然保护区，了解动植物，学生将在经验丰富的美术教师指导下进行艺术创作。",
        sessions: {
          session1: "2025年7月1日 - 7月14日",
          session2: "2025年7月15日 - 7月28日",
          session3: "2025年8月1日 - 8月14日",
        },
        deadline: "2025年6月15日",
        highlights: {
          highlight1: "资深美术教师授课，培养学生正确的绘画习惯",
          highlight2: "与来自世界各地的学生一起学习，锻炼英语口语能力",
          highlight3: "精心设计的课程，开拓学生的创造力和想象力",
          highlight4: "走访全美顶尖艺术院校，感受名校艺术氛围",
          highlight5: "7×24 小时安全防护，保证学生课程期间的个人安全",
        },
        academics: {
          academic1: "艺术基础理论与技法",
          academic2: "自然观察与写生技巧",
          academic3: "创意思维培养",
          academic4: "艺术史与文化背景",
          academic5: "作品集制作指导",
        },
        itinerary: {
          item1: "艺术基础课程学习",
          item2: "自然保护区参观写生",
          item3: "艺术博物馆参观",
          item4: "与当地艺术家交流",
          item5: "创作实践项目",
          item6: "艺术院校参访",
          item7: "作品展示准备",
          item8: "结业作品展览",
        },
        admission: {
          req1: "年龄：14-18岁",
          req2: "学历：初中在读或以上",
          req3: "语言：具备基础英语沟通能力",
          req4: "对艺术有浓厚兴趣",
          material1: "申请表",
          material2: "个人作品集（可选）",
          material3: "学术成绩单",
          material4: "推荐信（可选）",
          material5: "护照复印件",
        },
      },
      types: {
        innovation: "创意营理",
        stem: "STEM与科学创新",
        academic: "学术考察",
        cultural: "文化体验",
      },
      admin: {
        testimonials: {
          title: "学员故事库",
          description: "管理所有学员故事，支持图片上传和多语言内容。已发布的学员故事会自动同步到官网首页显示（按排序显示前3个）。",
          addStory: "添加学员故事",
          editStory: "编辑学员故事",
          createStory: "添加学员故事",
          cancel: "取消",
          save: "保存",
          update: "更新",
          create: "创建",
          saving: "保存中...",
          delete: "删除",
          edit: "编辑",
          confirmDelete: "确定要删除这个学员故事吗？",
          deleteSuccess: "学员故事删除成功！",
          createSuccess: "学员故事创建成功！",
          updateSuccess: "学员故事更新成功！",
          noStories: "暂无学员故事，点击上方\"添加学员故事\"按钮创建第一个故事",
          studentName: "学员姓名",
          studentRole: "学员身份",
          participatedProgram: "参与项目",
          storyContent: "学员故事",
          studentPhoto: "学员照片",
          status: "状态",
          order: "排序",
          published: "已发布",
          draft: "草稿",
          required: "必填",
          placeholders: {
            studentName: "请输入学员姓名",
            studentRole: "如：高中生、大学生、学生家长等",
            participatedProgram: "请输入项目名称",
            storyContent: "请输入学员的故事或感言...",
            order: "数字越小排序越靠前"
          },
          language: "语言",
          chinese: "中文",
          english: "English",
          backToDashboard: "返回仪表板",
          backToList: "返回学员故事列表"
        },
        blogs: {
          title: "博客库",
          description: "管理所有博客文章，支持图片上传和多语言内容。",
          addBlog: "添加博客",
          editBlog: "编辑博客",
          createBlog: "添加博客",
          noBlogs: "暂无博客文章，点击上方「添加博客」按钮创建第一篇文章",
          featuredImage: "特色图片",
          status: "状态",
          order: "排序",
          published: "已发布",
          draft: "草稿",
          edit: "编辑",
          delete: "删除",
          cancel: "取消",
          saving: "保存中...",
          update: "更新",
          create: "创建",
          backToList: "返回博客列表",
          language: "语言",
          chinese: "中文",
          english: "English",
          backToDashboard: "返回仪表板"
        },
        blog: {
          hero: {
            title: "我们的博客",
            description: "探索来自我们全球教育经验的见解、故事和技巧。了解国际教育和文化交流的最新趋势。"
          },
          noBlogs: "暂无博客文章",
          readMore: "阅读更多",
          notFound: "博客未找到",
          notFoundDesc: "抱歉，您要查找的博客文章不存在。",
          defaultDesc: "探索来自我们全球教育经验的见解、故事和技巧"
        },
        imageUpload: {
          studentPhoto: "学员照片",
          changePhoto: "更换照片",
          selectPhoto: "选择照片",
          dragDropText: "拖拽图片到此处，或点击选择文件",
          uploading: "上传中...",
          supportedFormats: "支持 JPEG、PNG、GIF、WebP 格式，最大 5MB",
          invalidFileType: "仅支持图片文件（JPEG、PNG、GIF、WebP）",
          fileTooLarge: "文件大小不能超过 5MB",
          uploadFailed: "上传失败，请重试"
        },
        chinaPrograms: {
          title: "游学中国项目管理",
          description: "管理所有游学中国项目，包括项目信息、图片和申请管理。",
          backToDashboard: "返回仪表板",
          backToList: "返回游学中国项目列表",
          addProgram: "添加中国项目",
          editProgram: "编辑中国项目",
          createProgram: "添加中国项目",
          cancel: "取消",
          save: "保存",
          update: "更新",
          create: "创建",
          saving: "保存中...",
          delete: "删除",
          edit: "编辑",
          confirmDelete: "确定要删除这个中国项目吗？",
          confirmUpdate: "确定要更新这个中国项目吗？",
          deleteSuccess: "中国项目删除成功！",
          createSuccess: "中国项目创建成功！",
          updateSuccess: "中国项目更新成功！",
          noPrograms: "暂无中国项目，点击上方\"添加中国项目\"按钮创建第一个项目",
          programTitle: "项目标题",
          programDescription: "项目描述",
          country: "国家",
          city: "城市",
          duration: "项目时长",
          deadline: "申请截止日期",
          featuredImage: "特色图片",
          gallery: "图片画廊",
          type: "项目类型",
          gradeLevel: "适合年级",
          sessions: "营期安排",
          highlights: "亮点 (Highlights)",
          academics: "学术 (Academics)",
          itinerary: "行程 (Itinerary)",
          requirements: "申请 (Admission)",
          status: "状态",
          published: "已发布",
          draft: "草稿",
          chinese: "中文",
          english: "English",
          placeholders: {
            programTitle: "请输入项目标题",
            programDescription: "请输入项目描述...",
            country: "请选择国家",
            city: "请选择城市",
            selectCountryFirst: "请先选择国家",
            duration: "如：2周；14天",
            sessions: "如：2025年7月10日 - 7月19日\n2025年8月10日 - 8月19日",
            highlights: "如：参观华为、腾讯总部\n深圳科技园区实地考察\n与科技从业者交流",
            academics: "如：中国科技发展史\n人工智能应用案例\n5G技术发展",
            itinerary: "如：第1-2天：深圳科技发展概览\n第3-4天：华为参访体验",
            requirements: "如：年龄16-24岁\n理工科背景优先\n对科技创新有浓厚兴趣"
          }
        }
      },
    },
  },
}

// Get initial language from URL or localStorage
const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    // Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search)
    const urlLang = urlParams.get('lang')
    if (urlLang && (urlLang === 'en' || urlLang === 'zh')) {
      return urlLang
    }

    // Check localStorage
    const savedLang = localStorage.getItem('younicko-lang')
    if (savedLang && (savedLang === 'en' || savedLang === 'zh')) {
      return savedLang
    }

    // Check browser language
    return navigator.language.startsWith('zh') ? 'zh' : 'en'
  }
  // For server-side, default to English to match the LanguageSwitcher default
  // This ensures consistency between server and client rendering
  return 'en'
}

// Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "en",
  debug: false,

  // have a common namespace used around the full app
  defaultNS: "common",
  ns: ["common", "programs"],

  keySeparator: ".",
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
})

export default i18n
