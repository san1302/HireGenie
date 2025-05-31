/**
 * Comprehensive Keyword Variation Database for ATS Analysis
 * Handles multiple industries, semantic matching, and complex variations
 */

import type { CompoundTerm } from './types';

/**
 * Comprehensive synonym and variation database
 */
export class KeywordVariationDatabase {
  private readonly synonymGroups: Map<string, Set<string>>;
  private readonly abbreviations: Map<string, Set<string>>;
  private readonly compoundTerms: Map<string, CompoundTerm>;
  private readonly industrySpecificTerms: Map<string, Map<string, Set<string>>>;
  private readonly commonMisspellings: Map<string, Set<string>>;
  
  constructor() {
    // Initialize comprehensive synonym groups
    this.synonymGroups = new Map([
      // Job titles and roles
      ['software developer', new Set(['software engineer', 'programmer', 'developer', 'swe', 'software dev', 'coding professional'])],
      ['senior', new Set(['sr', 'sr.', 'lead', 'principal', 'staff', 'expert'])],
      ['junior', new Set(['jr', 'jr.', 'entry level', 'associate', 'fresh graduate'])],
      ['manager', new Set(['mgr', 'management', 'supervisor', 'team lead', 'head of'])],
      ['architect', new Set(['solution architect', 'system architect', 'technical architect'])],
      ['consultant', new Set(['advisor', 'specialist', 'expert'])],
      
      // Technical skills - Programming Languages
      ['javascript', new Set(['js', 'ecmascript', 'es6', 'es2015', 'es2020'])],
      ['typescript', new Set(['ts'])],
      ['python', new Set(['py'])],
      ['c++', new Set(['cpp', 'cplusplus', 'c plus plus'])],
      ['c#', new Set(['csharp', 'c sharp', '.net', 'dotnet'])],
      ['java', new Set(['jvm'])],
      ['php', new Set(['php7', 'php8'])],
      ['ruby', new Set(['ruby on rails', 'rails'])],
      ['go', new Set(['golang'])],
      ['rust', new Set(['rust-lang'])],
      ['swift', new Set(['swift ui', 'swiftui'])],
      ['kotlin', new Set(['kotlin/jvm'])],
      
      // Frameworks and libraries
      ['react', new Set(['reactjs', 'react.js', 'react native'])],
      ['angular', new Set(['angularjs', 'angular.js', 'angular2+'])],
      ['vue', new Set(['vuejs', 'vue.js', 'vue3'])],
      ['node.js', new Set(['nodejs', 'node', 'express.js', 'express'])],
      ['django', new Set(['django rest framework', 'drf'])],
      ['flask', new Set(['flask-restful'])],
      ['spring', new Set(['spring boot', 'spring framework'])],
      ['laravel', new Set(['laravel framework'])],
      ['next.js', new Set(['nextjs', 'next'])],
      ['nuxt.js', new Set(['nuxtjs', 'nuxt'])],
      ['svelte', new Set(['sveltekit'])],
      
      // Databases
      ['mysql', new Set(['my sql'])],
      ['postgresql', new Set(['postgres', 'psql'])],
      ['mongodb', new Set(['mongo', 'mongo db'])],
      ['redis', new Set(['redis cache'])],
      ['elasticsearch', new Set(['elastic search', 'es'])],
      ['sqlite', new Set(['sqlite3'])],
      ['oracle', new Set(['oracle db'])],
      ['sql server', new Set(['mssql', 'microsoft sql server'])],
      
      // Cloud and DevOps
      ['amazon web services', new Set(['aws', 'amazon cloud'])],
      ['google cloud platform', new Set(['gcp', 'google cloud'])],
      ['microsoft azure', new Set(['azure', 'ms azure'])],
      ['continuous integration', new Set(['ci', 'continuous deployment', 'cd', 'ci/cd', 'ci-cd'])],
      ['kubernetes', new Set(['k8s', 'kube'])],
      ['docker', new Set(['containerization', 'containers'])],
      ['terraform', new Set(['infrastructure as code', 'iac'])],
      ['jenkins', new Set(['jenkins ci'])],
      ['github actions', new Set(['gh actions'])],
      ['gitlab ci', new Set(['gitlab ci/cd'])],
      
      // Data and ML
      ['machine learning', new Set(['ml', 'artificial intelligence', 'ai', 'deep learning', 'dl'])],
      ['data science', new Set(['data analysis', 'data analytics', 'statistical analysis'])],
      ['database', new Set(['db', 'data storage', 'data management'])],
      ['big data', new Set(['hadoop', 'spark', 'kafka'])],
      ['neural networks', new Set(['nn', 'deep neural networks', 'dnn'])],
      ['natural language processing', new Set(['nlp', 'text processing'])],
      ['computer vision', new Set(['cv', 'image processing'])],
      
      // Frontend Technologies
      ['html', new Set(['html5', 'hypertext markup language'])],
      ['css', new Set(['css3', 'cascading style sheets'])],
      ['sass', new Set(['scss'])],
      ['less', new Set(['less css'])],
      ['bootstrap', new Set(['bootstrap css'])],
      ['tailwind', new Set(['tailwind css'])],
      ['webpack', new Set(['module bundler'])],
      ['vite', new Set(['vite.js'])],
      
      // Testing
      ['unit testing', new Set(['unit tests', 'testing'])],
      ['integration testing', new Set(['integration tests'])],
      ['test driven development', new Set(['tdd'])],
      ['behavior driven development', new Set(['bdd'])],
      ['jest', new Set(['jest testing'])],
      ['cypress', new Set(['cypress testing'])],
      ['selenium', new Set(['selenium webdriver'])],
      
      // Methodologies
      ['agile', new Set(['agile methodology', 'agile development'])],
      ['scrum', new Set(['scrum master', 'scrum methodology'])],
      ['kanban', new Set(['kanban board'])],
      ['waterfall', new Set(['waterfall methodology'])],
      ['lean', new Set(['lean methodology'])],
      ['devops', new Set(['dev ops'])],
      
      // Business terms
      ['return on investment', new Set(['roi'])],
      ['key performance indicator', new Set(['kpi', 'metrics'])],
      ['business to business', new Set(['b2b', 'b to b'])],
      ['business to consumer', new Set(['b2c', 'b to c'])],
      ['software as a service', new Set(['saas'])],
      ['platform as a service', new Set(['paas'])],
      ['infrastructure as a service', new Set(['iaas'])],
      
      // Action verbs (critical for experience matching)
      ['developed', new Set(['built', 'created', 'designed', 'implemented', 'engineered', 'constructed', 'established'])],
      ['managed', new Set(['led', 'supervised', 'oversaw', 'directed', 'coordinated', 'administered'])],
      ['improved', new Set(['enhanced', 'optimized', 'upgraded', 'refined', 'boosted', 'increased'])],
      ['analyzed', new Set(['examined', 'evaluated', 'assessed', 'reviewed', 'studied', 'investigated'])],
      ['collaborated', new Set(['worked with', 'partnered', 'cooperated', 'teamed up'])],
      ['delivered', new Set(['shipped', 'deployed', 'launched', 'released'])],
      
      // Soft skills
      ['communication', new Set(['communicating', 'interpersonal', 'verbal', 'written'])],
      ['leadership', new Set(['leading', 'management', 'team building', 'mentoring'])],
      ['problem solving', new Set(['troubleshooting', 'analytical', 'critical thinking', 'solution oriented'])],
      ['teamwork', new Set(['collaboration', 'team player', 'cooperative'])],
      ['adaptability', new Set(['flexible', 'versatile', 'adaptable'])],
      ['creativity', new Set(['innovative', 'creative thinking', 'imaginative'])],
      
      // Security
      ['cybersecurity', new Set(['cyber security', 'information security', 'infosec'])],
      ['authentication', new Set(['auth', 'oauth', 'jwt'])],
      ['encryption', new Set(['ssl', 'tls', 'https'])],
      ['penetration testing', new Set(['pen testing', 'security testing'])],
    ]);
    
    // Compound terms that should be matched as units
    this.compoundTerms = new Map([
      ['machine learning', { full: 'machine learning', parts: ['machine', 'learning'], mustMatchAll: true }],
      ['data science', { full: 'data science', parts: ['data', 'science'], mustMatchAll: true }],
      ['project management', { full: 'project management', parts: ['project', 'management'], mustMatchAll: true }],
      ['user experience', { full: 'user experience', parts: ['user', 'experience'], mustMatchAll: false }], // Can match "UX" alone
      ['full stack', { full: 'full stack', parts: ['full', 'stack'], mustMatchAll: true }],
      ['version control', { full: 'version control', parts: ['version', 'control'], mustMatchAll: false }], // Can match "git" alone
      ['software development', { full: 'software development', parts: ['software', 'development'], mustMatchAll: true }],
      ['web development', { full: 'web development', parts: ['web', 'development'], mustMatchAll: true }],
      ['mobile development', { full: 'mobile development', parts: ['mobile', 'development'], mustMatchAll: true }],
      ['artificial intelligence', { full: 'artificial intelligence', parts: ['artificial', 'intelligence'], mustMatchAll: true }],
      ['natural language processing', { full: 'natural language processing', parts: ['natural', 'language', 'processing'], mustMatchAll: true }],
      ['computer vision', { full: 'computer vision', parts: ['computer', 'vision'], mustMatchAll: true }],
      ['cloud computing', { full: 'cloud computing', parts: ['cloud', 'computing'], mustMatchAll: true }],
      ['big data', { full: 'big data', parts: ['big', 'data'], mustMatchAll: true }],
      ['test driven development', { full: 'test driven development', parts: ['test', 'driven', 'development'], mustMatchAll: true }],
      ['continuous integration', { full: 'continuous integration', parts: ['continuous', 'integration'], mustMatchAll: true }],
      ['agile development', { full: 'agile development', parts: ['agile', 'development'], mustMatchAll: false }],
    ]);
    
    // Industry-specific variations
    this.industrySpecificTerms = new Map([
      ['healthcare', new Map([
        ['electronic health records', new Set(['ehr', 'emr', 'electronic medical records'])],
        ['health insurance portability', new Set(['hipaa', 'privacy compliance'])],
        ['registered nurse', new Set(['rn', 'nursing professional'])],
        ['certified nursing assistant', new Set(['cna'])],
        ['licensed practical nurse', new Set(['lpn'])],
        ['medical doctor', new Set(['md', 'physician'])],
        ['nurse practitioner', new Set(['np'])],
        ['physician assistant', new Set(['pa'])],
        ['clinical research', new Set(['clinical trials', 'medical research'])],
        ['patient care', new Set(['patient management', 'bedside manner'])],
      ])],
      ['finance', new Map([
        ['certified public accountant', new Set(['cpa', 'accountant'])],
        ['financial analysis', new Set(['financial modeling', 'financial planning'])],
        ['anti-money laundering', new Set(['aml', 'compliance'])],
        ['know your customer', new Set(['kyc'])],
        ['risk management', new Set(['risk assessment', 'risk analysis'])],
        ['investment banking', new Set(['ib', 'capital markets'])],
        ['private equity', new Set(['pe'])],
        ['venture capital', new Set(['vc'])],
        ['hedge fund', new Set(['alternative investments'])],
        ['financial planning', new Set(['wealth management'])],
      ])],
      ['marketing', new Map([
        ['search engine optimization', new Set(['seo', 'organic search'])],
        ['pay per click', new Set(['ppc', 'paid search', 'sem'])],
        ['customer relationship management', new Set(['crm', 'salesforce'])],
        ['social media marketing', new Set(['smm', 'social marketing'])],
        ['content marketing', new Set(['content strategy'])],
        ['email marketing', new Set(['email campaigns'])],
        ['conversion rate optimization', new Set(['cro'])],
        ['marketing automation', new Set(['martech'])],
        ['brand management', new Set(['brand strategy'])],
        ['digital marketing', new Set(['online marketing'])],
      ])],
      ['education', new Map([
        ['curriculum development', new Set(['curriculum design'])],
        ['instructional design', new Set(['learning design'])],
        ['student assessment', new Set(['evaluation', 'grading'])],
        ['classroom management', new Set(['behavior management'])],
        ['special education', new Set(['special needs'])],
        ['english as second language', new Set(['esl', 'english language learning'])],
        ['learning management system', new Set(['lms'])],
        ['educational technology', new Set(['edtech'])],
      ])],
      ['manufacturing', new Map([
        ['lean manufacturing', new Set(['lean production'])],
        ['six sigma', new Set(['6 sigma', 'quality improvement'])],
        ['total quality management', new Set(['tqm'])],
        ['supply chain management', new Set(['scm', 'logistics'])],
        ['quality assurance', new Set(['qa', 'quality control', 'qc'])],
        ['production planning', new Set(['manufacturing planning'])],
        ['inventory management', new Set(['stock management'])],
        ['just in time', new Set(['jit'])],
      ])],
    ]);
    
    // Common misspellings and typos
    this.commonMisspellings = new Map([
      ['javascript', new Set(['javscript', 'javascrip', 'javasript'])],
      ['management', new Set(['managment', 'mangement', 'managament'])],
      ['experience', new Set(['experiance', 'expereince', 'experince'])],
      ['professional', new Set(['profesional', 'proffesional', 'professinal'])],
      ['development', new Set(['developement', 'devlopment'])],
      ['communication', new Set(['comunication', 'communciation'])],
      ['responsibility', new Set(['responsability', 'responsiblity'])],
      ['environment', new Set(['enviroment', 'enviornment'])],
      ['implementation', new Set(['implmentation', 'implementaion'])],
      ['collaboration', new Set(['colaboration', 'collaberation'])],
    ]);
    
    // Initialize abbreviations (bidirectional)
    this.abbreviations = this.buildAbbreviationMap();
  }
  
  private buildAbbreviationMap(): Map<string, Set<string>> {
    const abbrevMap = new Map<string, Set<string>>();
    
    // Extract abbreviations from synonym groups
    this.synonymGroups.forEach((synonyms, key) => {
      synonyms.forEach(synonym => {
        // If it looks like an abbreviation (short, possibly with dots)
        if (synonym.length <= 4 || synonym.includes('.')) {
          if (!abbrevMap.has(key)) {
            abbrevMap.set(key, new Set());
          }
          abbrevMap.get(key)!.add(synonym);
        }
      });
    });
    
    return abbrevMap;
  }
  
  /**
   * Get all variations of a keyword including synonyms, abbreviations, and misspellings
   */
  getAllVariations(keyword: string): Set<string> {
    const variations = new Set<string>([keyword.toLowerCase()]);
    
    // Add direct synonyms
    const keyLower = keyword.toLowerCase();
    if (this.synonymGroups.has(keyLower)) {
      this.synonymGroups.get(keyLower)!.forEach(syn => variations.add(syn));
    }
    
    // Check if keyword is itself a synonym of something else
    this.synonymGroups.forEach((syns, mainTerm) => {
      if (syns.has(keyLower)) {
        variations.add(mainTerm);
        syns.forEach(syn => variations.add(syn));
      }
    });
    
    // Add common misspellings
    if (this.commonMisspellings.has(keyLower)) {
      this.commonMisspellings.get(keyLower)!.forEach(misspelling => variations.add(misspelling));
    }
    
    return variations;
  }
  
  /**
   * Check if a term is a compound term that needs special handling
   */
  isCompoundTerm(term: string): CompoundTerm | null {
    const termLower = term.toLowerCase();
    return this.compoundTerms.get(termLower) || null;
  }
  
  /**
   * Get industry-specific variations
   */
  getIndustryVariations(term: string, industry: string): Set<string> {
    const variations = new Set<string>();
    const industryTerms = this.industrySpecificTerms.get(industry);
    
    if (industryTerms) {
      const termLower = term.toLowerCase();
      if (industryTerms.has(termLower)) {
        industryTerms.get(termLower)!.forEach(var_ => variations.add(var_));
      }
      
      // Check reverse mapping
      industryTerms.forEach((vars, mainTerm) => {
        if (vars.has(termLower)) {
          variations.add(mainTerm);
          vars.forEach(v => variations.add(v));
        }
      });
    }
    
    return variations;
  }
  
  /**
   * Get all available industries
   */
  getAvailableIndustries(): string[] {
    return Array.from(this.industrySpecificTerms.keys());
  }
} 