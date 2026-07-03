/* ============================================================
   Content Strategy Library — data
   Re-ported from the revised Claude Design handoff (Design authoritative).
   Hand-added helpers ACCENT_CHOICES / SOURCE_NAMES preserved.
   ============================================================ */

window.CATEGORY_ORDER = [
  ['Strategy & Foundation', 'strategy'],
  ['Discovery', 'discovery'],
  ['Audience', 'audience'],
  ['The Core', 'core'],
  ['Structure & Mapping', 'structure'],
  ['Planning & Operations', 'planning'],
  ['Measurement', 'measurement'],
  ['Information Architecture', 'ia']
];

window.TOOLS = [
      { id:'charter', name:'Content Marketing Charter', glyph:'01', category:'Strategy & Foundation', cat:'strategy',
        tagline:'Aligns goals, audience, pillars, and KPIs on a single master page.',
        visual:'Why we make content / Who it serves / What we create / How we measure it',
        summary:'A content marketing charter (sometimes called a one-page strategy) is the master document that ties together your program\'s purpose, audience, content themes, and success metrics. It is the guide you write before anything else, and the reference you return to whenever decisions are contested. Unlike a lengthy strategy deck, it fits on one page precisely so every team member actually reads it. The one-page format traces to the Content Marketing Institute — Ann Gynn\'s "1-page content marketing strategy," resting on Joe Pulizzi\'s content-mission work.',
        whenToUse:['Before launching or relaunching a content program, to give the whole team a shared north star.','When priorities drift and different stakeholders begin pulling content in different directions.','At the start of a new fiscal year, to reset goals and confirm the strategy still fits the business.'],
        links:[{label:'CMI: How To Write a 1-Page Content Marketing Strategy (Ann Gynn)',url:'https://contentmarketinginstitute.com/strategy-planning/write-one-page-content-marketing-strategy'},{label:'CMI: How to Develop a Content Strategy — Start With These 3 Questions (Jodi Harris)',url:'https://contentmarketinginstitute.com/content-marketing-strategy/how-to-develop-a-content-strategy-start-with-these-3-questions'},{label:'CMI: Content Marketing Strategy — The Best Checklists and Templates',url:'https://contentmarketinginstitute.com/content-optimization/content-marketing-strategy-the-best-checklists-and-templates'},{label:'Content Marketing University / Robert Rose: Building Teams and Charters',url:'https://contentmarketinguniversity.com/content-marketing-certification/building-the-team-and-its-charter/'},{label:'CoSchedule: How to Plan a Content Marketing Strategy [free template]',url:'https://coschedule.com/content-marketing/content-strategy-template'},{label:'HubSpot: How to Develop a Content Strategy in 7 Steps [free template]',url:'https://blog.hubspot.com/marketing/content-marketing-plan'},{label:'Steven Keith: How to Write a Strategic Content Marketing Program Charter',url:'https://www.linkedin.com/pulse/how-write-strategic-content-marketing-program-charter-steven-keith'}],
        notes:[{tone:'info',title:'Content Charter vs. Project Brief',paras:[['These two are easy to confuse, but they sit at different altitudes. A content charter is a strategic plan: it defines why your content program exists, who it serves, the themes it owns, and how success is measured, and it stays stable over time. A project brief is the specific project details, including the scope, goals, owner, deadline, and requirements for a single deliverable or campaign. Every brief should ladder up to the charter: the brief executes, the charter directs.']]}],
        related:['mission','kpi','pillars'] },

      { id:'mission', name:'Editorial Mission Statement', glyph:'02', category:'Strategy & Foundation', cat:'strategy',
        tagline:'A one-sentence filter for every content decision you will ever make.',
        visual:'We help [audience] do [outcome] by providing [content type].',
        summary:'An editorial mission statement boils down your content program into a single sentence: the audience it serves, what that audience achieves, and the type of content you provide. Robert Rose and Joe Pulizzi popularized the format. The discipline lies in making it specific enough to actually reject ideas that don\'t fit. If everything fits this filter, the mission is too vague.',
        whenToUse:['Before building a content team, to create a hiring and editorial standard from day one.','When the content calendar sprawls and no one can explain why certain topics do or do not belong.','As a shorthand reference in editorial meetings when evaluating pitches.'],
        links:[{label:'CMI, how to write a content marketing mission statement with examples',url:'https://contentmarketinginstitute.com/content-marketing-strategy/how-to-write-an-inspiring-content-marketing-mission-statement-examples'},{label:'Orbit Media, fill-in-the-blank mission template',url:'https://www.orbitmedia.com/blog/content-marketing-mission-statement/'},{label:'i-SCOOP, the content marketing mission statement (from Joe Pulizzi\'s book Epic Content Marketing)',url:'https://www.i-scoop.eu/content-marketing/content-marketing-mission-statement/'}],
        notes:[{tone:'info',title:'An editorial mission, not a company mission',paras:[['Keep the altitude straight: this is a mission statement at the content level, specifically editorial. It defines who your content serves, what it helps them do, and the kind of content you make. It is not your company mission, vision, or values statement. That said, a strong editorial mission should take those into account and stay consistent with them, translating the company\'s purpose into a filter for what you publish.']]}],
        related:['charter','pillars','voicetone'] },

      { id:'pillars', name:'Content Pillars / Themes', glyph:'03', category:'Strategy & Foundation', cat:'strategy',
        tagline:'The three to five durable themes that organize everything you publish.',
        visual:'Own three to five themes. Commit. Cut the rest.',
        summary:'Content pillars are the brand-level territories your program commits to owning, distinct from SEO-driven topic clusters, which are tactical. Pillars drive the kind of content produced. One might be "responsible sourcing" or "founder stories"; a topic cluster is "how to source ethically at scale." Pillars provide the editorial coherence and lead to content that is authored rather than assembled. If you can\'t trace a content idea back to the pillar, it doesn\'t belong.',
        whenToUse:['When the content calendar feels random, topics get chosen by whoever spoke last or loudest in the meeting.','As the organizing layer between the mission statement (why) and the tactical editorial calendar (when).'],
        links:[{label:'CMI (Jodi Harris), the strategic pillars behind every winning content strategy',url:'https://contentmarketinginstitute.com/strategy-planning/content-strategy-pillars'},{label:'Sprout Social, a guide to social media content pillars',url:'https://sproutsocial.com/insights/social-media-content-pillars/'},{label:'Tabitha Whiting, how to implement content pillars for a focused strategy',url:'https://tabithawhiting.com/2024/10/17/content-pillars-explained/'},{label:'Tabitha Whiting, 7 examples of content pillars from real companies',url:'https://tabithawhiting.com/2024/11/12/content-pillar-examples/'},{label:'Margot Bloomstein via OpenView, content strategy starts with a message architecture',url:'https://openviewpartners.com/blog/building-your-content-strategy-with-a-message-architecture/'},{label:'CMI, which of these 3 content pillar (SEO pillar page) types should you build',url:'https://contentmarketinginstitute.com/demand-generation/which-of-these-3-content-pillar-types-should-you-build'}],
        notes:[{tone:'info',title:'Pillars: which kind do you mean?',paras:[['The word "pillars" gets attached to several different things, and conflating them causes real strategic confusion. ',{t:'Content pillars',url:'https://pinckneyharmon.com/content-pillars-guide/'},' are the durable themes your content program owns. ',{t:'Brand pillars',url:'https://blog.hubspot.com/marketing/brand-pillars'},' are the core values and characteristics that define the brand itself. ',{t:'Messaging pillars',url:'https://www.aha.io/roadmapping/guide/marketing-templates/messaging-templates'},' are the key themes a messaging framework communicates to differentiate you. And ',{t:'social pillars',url:'https://sproutsocial.com/insights/social-media-content-pillars/'},' are the recurring content categories for a specific social channel.'],['Avoid the term "core pillars" altogether. It gets used loosely to mean any of the above, and because it never says what level it is foundational to, it reliably creates more confusion than clarity.']]},{tone:'warn',title:'Social pillars must ladder up to content strategy',paras:[['It is great for social media managers to think strategically, but a ',{t:'social media content strategy',url:'https://sproutsocial.com/insights/social-media-content-pillars/'},' should always be aligned with and come out of a greater content strategy. Otherwise you are going rogue, introducing discord into the wider messaging and harming the brand, even if you are posting big numbers and you feel like you "just get social" while your boss does not.'],['If you sense a lack of goals and direction and feel you are building content strategy from scratch, push back on the decision-makers you report to and make sure they give you the overall business goal your social efforts exist to contribute to.']]}],
        related:['charter','clusters','calendar'] },

      { id:'audit', name:'Content Audit + Inventory', glyph:'04', category:'Discovery', cat:'discovery',
        tagline:'A full census and quality assessment of every asset you own.',
        visual:'Keep / Revise / Consolidate / Kill',
        summary:'A content audit combines two tasks: inventory (cataloging everything that exists, URLs, titles, formats, owners) and assessment (judging each asset against quality, performance, and strategic criteria). The output is a disposition per asset: keep, revise, consolidate, or kill. Running the audit without a disposition framework produces a spreadsheet; running it with one produces a plan. Meghan Casey\'s Content Strategy Toolkit is the definitive book of these templates.',
        whenToUse:['Before any redesign or CMS migration, you cannot make good structural decisions without a working idea of what content exists.','When quality feels inconsistent and you need quantifiable evidence of where the problems are concentrated.','Before establishing a governance model, to set the baseline you will be held to going forward.'],
        links:[{label:'Column Five, how to do a content audit (guide + template)',url:'https://www.columnfivemedia.com/how-to-do-a-content-audit-content-strategy/'},{label:'TechTarget, how to conduct a content audit step by step (with template)',url:'https://www.techtarget.com/searchContentManagement/tip/How-to-conduct-a-content-audit-Step-by-step-with-template'},{label:'Semrush, the content audit guide',url:'https://www.semrush.com/blog/content-audit/'}],
        related:['gap','governance','lifecycle'] },

      { id:'gap', name:'Competitive Content Gap Analysis', glyph:'05', category:'Discovery', cat:'discovery',
        tagline:'Finds the topics competitors cover that you do not.',
        visual:'Audience needs − Content you have = Content to create',
        summary:'A gap analysis maps the intersection of what your audience searches for and needs against what you and your competitors currently publish. It surfaces uncovered topics, under-served funnel stages, and formats competitors win with that you haven\'t attempted. Ahrefs\' Content Gap tool automates the keyword layer; the strategic layer still requires judgment about which gaps are actually worth filling.',
        whenToUse:['After a content audit, to translate findings into a forward-looking content roadmap.','When organic traffic plateaus despite consistent publishing, the existing slate may be fully competed.','When entering a new market, audience, or product category your current content doesn\'t address.'],
        links:[{label:'Ahrefs, how to do a content gap analysis (walkthrough + template)',url:'https://ahrefs.com/blog/content-gap-analysis/'},{label:'Semrush, content gap analysis — a step-by-step guide',url:'https://www.semrush.com/blog/content-gap-analysis/'},{label:'Backlinko, content gap analysis — the complete guide',url:'https://backlinko.com/hub/seo/content-gap'},{label:'Search Engine Land, SEO gap analysis — find content and keyword gaps',url:'https://searchengineland.com/guide/gap-analysis'},{label:'CMI (Kelsey Raymond), find and close the hidden gaps in your content strategy',url:'https://contentmarketinginstitute.com/content-marketing-strategy/how-to-find-and-close-the-hidden-gaps-in-your-content-strategy'},{label:'Semrush, keyword gap analysis — what it is and how to do it',url:'https://www.semrush.com/blog/keyword-gap-analysis/'}],
        notes:[{tone:'info',title:'Step one in competitor displacement',paras:[['This is the first move in competitor displacement: finding where competitors are winning, then beating them at specific clash points. The gap analysis locates the contested ground; the displacement happens when you out-execute them there.']]},{tone:'warn',title:'A discovery tool, not the decider',paras:[['A warning before you start: this should not be the authoritative determiner of your content strategy. It is a strategic discovery tool that surfaces options and reveals the terrain, but the actual decisions must come from your business goals, not from whatever a competitor happens to be doing.']]}],
        related:['audit','persona','clusters'] },

      { id:'swot', name:'Content SWOT', glyph:'06', category:'Discovery', cat:'discovery',
        tagline:'Strengths, weaknesses, opportunities, and threats, scoped to content.',
        visual:'Strengths / Weaknesses / Opportunities / Threats',
        summary:'A content SWOT applies the classic strategy framework to the content program itself. Internal factors (what you do well, where you\'re weak) and external factors (gaps competitors miss, platform or algorithm shifts) reveal the strategic terrain before a program is built or reset. It is most valuable as a group exercise, different team members surface blind spots no single person holds.',
        whenToUse:['At the beginning of a strategy cycle, to make the competitive and organizational context explicit before tactics are chosen.','After an audit surfaces quality and performance data, to interpret patterns in strategic terms.','When making the case for investment, to ground the argument in an honest read of the geography.'],
        links:[{label:'Puyt, Lie & Wilderom (2023), the origins of SWOT analysis — peer-reviewed history (open access)',url:'https://pure.hva.nl/ws/files/45262505/1-s2.0-S0024630123000110-main.pdf'},{label:'Madsen & Grønbæk (2025), from SOFT approach to SWOT analysis (Journal of Management History)',url:'https://www.emerald.com/jmh/article/31/2/333/1239245/From-SOFT-approach-to-SWOT-analysis-a-historical'},{label:'Mind Tools, SWOT Analysis (method + note on disputed origin)',url:'https://www.mindtools.com/amtbj63/swot-analysis'},{label:'Toolshero, Albert Humphrey (credited SWOT/SOFT popularizer, SRI)',url:'https://www.toolshero.com/toolsheroes/albert-humphrey/'},{label:'CoSchedule, marketing SWOT analysis how-to with a real worked example',url:'https://coschedule.com/marketing-strategy/swot-analysis'},{label:'HubSpot, how to use a SWOT analysis in content strategy (with template)',url:'https://blog.hubspot.com/marketing/swot-analyses-content-strategy'}],
        notes:[{tone:'info',title:'Related to the content audit, but sharper',paras:[['A content SWOT is closely related to the ',{t:'Content Audit',tool:'audit'},', but it is less of a sweeping inventory and more a way to analyze how effective your existing content actually is, and how it holds up in a ',{t:'Competitive Content Gap Analysis',tool:'gap'},'.']]}],
        related:['charter','audit','gap'] },

      { id:'persona', name:'Audience Personas', glyph:'07', category:'Audience', cat:'audience',
        tagline:'Named composite profiles of the readers you are actually writing for.',
        visual:'Name → Goal → Context → Questions they ask',
        summary:'A persona distills qualitative and quantitative research into a memorable archetype: a named character with a role, goals, context, vocabulary, and the specific questions they bring to your content. The purpose is alignment, when a team disagrees about tone, depth, or what counts as useful, a well-researched persona resolves the argument. Without research as input, personas are just decorative fiction.',
        whenToUse:['Before building a content calendar, to ensure topics are chosen for a real audience (or as real as possible!) rather than internal preference.','When teams argue about tone, terminology, or whether a piece resonates with them or not. (If they aren\'t the target audience, why should it?)','As input to a journey map, a messaging hierarchy, or a voice and tone guide.'],
        links:[{label:'Alan Cooper, "The Origin of Personas" (Cooper Journal, 2008)',url:'https://www.cooper.com/journal/2008/5/the_origin_of_personas/'},{label:'Alan Cooper, The Inmates Are Running the Asylum — free sample chapter (personas)',url:'https://ptgmedia.pearsoncmg.com/images/9780672326141/samplepages/0672326140.pdf'},{label:'Nielsen Norman Group, Personas: Study Guide (Kate Kaplan)',url:'https://www.nngroup.com/articles/personas-study-guide/'},{label:'Nielsen Norman Group, Personas Make Users Memorable (Taylor Dykes)',url:'https://www.nngroup.com/articles/persona/'},{label:'CMI (Jodi Harris), build robust B2B marketing personas',url:'https://contentmarketinginstitute.com/audience-building/build-b2b-marketing-personas'},{label:'CMI (Marcia Riefer Johnston), create a buyer persona: 9 essentials',url:'https://contentmarketinginstitute.com/audience-building/create-a-buyer-persona-9-essentials'}],
        notes:[{tone:'info',title:'Realistic but theoretical people',paras:[['The goal is to create realistic but theoretical people you are marketing to, informed by real and valid data. They never existed, yet everything about them is grounded in evidence. Done well, this is what gets strategists, content creators, and creatives aligned on exactly who the audience is, so the whole team is picturing the same person.']]},{tone:'info',title:'But I have not done the original research. Can I use existing research?',paras:[['Your business strategy must decide whether you are in a position to benefit from original research. It may not be preferred if you do not have the experience, or cannot establish valid quantitative data or qualitative results. You can either hire a third party to execute a specific research-gathering effort, or distill insights yourself from data that already exists on platforms that offer information about your target demographic. Or a mixture of these efforts.'],['Good DIY platforms and services for the second path include ',{t:'Resonate',url:'https://www.resonate.com/'},', ',{t:'SparkToro',url:'https://sparktoro.com/'},', ',{t:'Statista',url:'https://www.statista.com/'},', ',{t:'Pew Research Center',url:'https://www.pewresearch.org/'},', and ',{t:'Think with Google',url:'https://www.thinkwithgoogle.com/'},'.']]}],
        related:['journey','jtbd','voc'] },

      { id:'journey', name:'Customer Journey Map', glyph:'08', category:'Audience', cat:'audience',
        tagline:'Maps what each persona needs at every stage of the experience.',
        visual:'Awareness → Consideration → Decision → Retention',
        summary:'A journey map traces a persona\'s path from first becoming aware of a problem through to becoming a loyal customer, capturing questions, emotional states, and content needs at each stage. It applies to all customers in the abstract: B2B and direct-to-consumer, recruitment candidates, donors, members, and anyone else you are trying to move along a path. Applied to content strategy, it exposes where assets exist, where they\'re missing, and where content is technically present but wrong for the moment. Most programs over-index on awareness or decision-making, and too often combine them.',
        whenToUse:['When content feels disconnected, high awareness traffic that doesn\'t convert to deeper engagement.','To align content investment with marketing, sales, and support touchpoints that aren\'t historically coordinated.','When pipeline velocity slows at a predictable stage and you suspect content is the missing link.'],
        links:[{label:'Nielsen Norman Group, Journey Mapping 101 (Sarah Gibbons)',url:'https://www.nngroup.com/articles/journey-mapping-101/'},{label:'Nielsen Norman Group, customer journey maps — when and how to create them (Kate Kaplan)',url:'https://www.nngroup.com/articles/customer-journey-mapping/'},{label:'Nielsen Norman Group, UX mapping methods: study guide',url:'https://www.nngroup.com/articles/ux-mapping-methods-study-guide/'},{label:'Nielsen Norman Group, journey-map digital template (free spreadsheet)',url:'https://www.nngroup.com/articles/journey-map-digital-template/'},{label:'CMI (Jodi Harris), a 4-step customer journey map process for better content results [template]',url:'https://contentmarketinginstitute.com/analytics-data/a-4-step-customer-journey-map-process-for-better-content-results-template'},{label:'CMI (Marcia Riefer Johnston), customer-journey map template with a worked Starbucks example',url:'https://contentmarketinginstitute.com/analytics-data/wonder-what-content-to-create-try-a-customer-journey-map-template'}],
        notes:[{tone:'info',title:'A great next step after personas',paras:[['This is a great next step once you have defined your ',{t:'Audience Personas',tool:'persona'},'. Keep in mind that each persona may realistically follow a different journey, depending on how granular you are getting. One map rarely fits everyone.']]},{tone:'info',title:'How many steps? There is no single right answer',paras:[['There are many interpretations of the customer journey steps. Some models use four (for example Awareness, Consideration, Decision, Retention), while others run five to seven by adding stages like Loyalty, Advocacy, or Onboarding. This is a question of how granular you plan the steps, not a matter of right or wrong.']]},{tone:'warn',title:'Prepare for friction from conversion-driven roles',paras:[['Prepare for friction from sales and conversion-driven roles, who will largely only care about the decision-making stage. Content strategists endeavoring to plan an effective customer journey must be prepared to show the value of ALL steps in the journey, and should be ready to remind results-driven leadership teams and sales teams that nobody walks into a grocery store ready to check out: first they have to find what they want.']]}],
        related:['persona','jtbd','matrix'] },

      { id:'jtbd', name:'Jobs-to-be-Done / Value Prop Canvas', glyph:'09', category:'Audience', cat:'audience',
        tagline:'Frames content around the task the reader is hiring it to complete.',
        visual:'When I ___, I want to ___, so I can ___.',
        summary:'Jobs-to-be-Done starts from a simple reframe: people do not really buy products, they "hire" them to make progress on a job they are trying to get done. The tool maps that job across its functional, emotional, and social dimensions, along with the pains and gains around it, then maps those against what you offer, so you analyze the audience by the progress they are chasing rather than by their demographics or attributes. Applied to content, it shifts the question from "what do we want to say" to "what is the reader trying to accomplish right now," which produces a very different brief.',
        whenToUse:['When content is brand-led or feature-led rather than built around documented reader needs.','To generate topic ideas that originate from real jobs or purposes, rather than keyword volume or what the team finds interesting.','As a complement or alternative to demographic personas, useful when the audience defies neat segmentation.'],
        links:[{label:'Harvard Business Review (Christensen et al.), Know Your Customers\' "Jobs to Be Done" (origin)',url:'https://hbr.org/2016/09/know-your-customers-jobs-to-be-done'},{label:'Strategyzer, the Value Proposition Canvas (official explainer, Osterwalder)',url:'https://www.strategyzer.com/library/the-value-proposition-canvas'},{label:'Christensen Institute, Jobs to Be Done theory (case studies + framework)',url:'https://www.christenseninstitute.org/theory/jobs-to-be-done/'},{label:'CMI, keep your audience top of mind with the simple Jobs-to-Be-Done formula',url:'https://contentmarketinginstitute.com/audience-building/keep-your-audience-top-of-mind-with-the-simple-jobs-to-be-done-formula'},{label:'Intercom (Matt Hodges), how to market the Job-to-be-Done (case study)',url:'https://www.intercom.com/blog/marketing-the-job-to-be-done/'},{label:'Harvard Business School Online, the Jobs to Be Done framework and real-world examples',url:'https://online.hbs.edu/blog/post/jobs-to-be-done-examples'}],
        related:['persona','voc','matrix'] },

      { id:'voc', name:'Voice-of-Customer / Message Mining', glyph:'10', category:'Audience', cat:'audience',
        tagline:'Extracts exact customer language from reviews, calls, and support tickets.',
        visual:'Listen / Extract / Mirror / Deploy',
        summary:'Voice-of-customer (VoC) research harvests the actual language customers use to describe their problems, goals, and reactions, from review sites, support transcripts, sales call recordings, and NPS verbatims. The insight is not just what customers say but how they say it: the specific phrases, analogies, and framings that resonate. Content built on VoC language routinely outperforms content written in brand-speak.',
        whenToUse:['Before writing a messaging hierarchy or landing page copy, to build it in customer vocabulary rather than internal jargon.','When conversion rates are flat despite high traffic, suggesting a mismatch between content and audience.','During a rebrand or positioning refresh.'],
        links:[{label:'Joanna Wiebe / Copyhackers, Amazon review mining — the origin article (2014)',url:'https://copyhackers.com/2014/10/amazon-review-mining/'},{label:'Joanna Wiebe / Copyhackers, rapid-fire review mining shortcut',url:'https://copyhackers.com/how-to-do-rapid-fire-review-mining/'},{label:'Jen Havice, Finding the Right Message — the definitive VoC-to-copy book',url:'https://www.amazon.com/Finding-Right-Message-Customer-Irresistible/dp/0578648725'},{label:'Jen Havice / CXL, how to use voice-of-customer research to boost conversions',url:'https://cxl.com/blog/voice-of-customer/'},{label:'Joel Klettke, the least sexy, most powerful way to get better copy (customer interviews)',url:'https://businesscasualcopywriting.com/customer-interviews/'},{label:'Valentina Chanova, message-mining guide and template',url:'https://valchanova.me/message-mining-guide-template/'}],
        related:['persona','jtbd','voicetone'] },

      { id:'corestatement', name:'Core Strategy Statement + Messaging Framework', glyph:'11', category:'The Core', cat:'core',
        tagline:'The single document that tells every writer what to say and in what order.',
        visual:'Core promise → Supporting pillars → Proof points',
        summary:"The core strategy statement (popularized by Brain Traffic and Meghan Casey) answers three questions in one sentence: who your content is for, what it delivers to them, and what it enables them to do. Paired with a messaging framework, which arranges claims into a hierarchy of core message, supporting pillars, and proof points, it becomes the master document every writer works from. It is the difference between a team that sounds coordinated and one that sounds like different brands in the same building.",
        whenToUse:['When each team or channel produces content that sounds like it came from different organizations.','Before a product launch, campaign, or rebrand, to lock the story before execution begins.','As the master reference document for all external-facing content.'],
        links:[{label:'Brain Traffic / Meghan Casey, core strategy statement explainer',url:'https://www.peachpit.com/articles/article.aspx?p=2422809'},{label:'CMI, keep your content on strategy with this statement template',url:'https://contentmarketinginstitute.com/content-marketing-strategy/keep-your-content-on-strategy-with-this-single-statement-templates'}],
        related:['mission','pillars','voicetone'] },

      { id:'voicetone', name:'Brand Voice + Tone Guide', glyph:'12', category:'The Core', cat:'core',
        tagline:'Articulates the brand personality, and how it flexes by situation.',
        visual:'Voice stays constant. Tone adapts to context.',
        summary:"A voice and tone guide defines the stable personality behind all brand communications (voice) and how that personality adjusts its register for different contexts, a crisis response versus a product launch, a support email versus a social post (tone). The most effective guides include concrete before-and-after examples and channel-specific notes. Without examples, every writer interprets the \"speaker\" differently.",
        whenToUse:['When multiple writers produce content that sounds correct and on-topic, but clearly not the same brand.','During a rebrand or pivot after audience feedback.','To onboard freelancers, agencies, or new team members quickly and with shared reference points.'],
        links:[{label:'Mailchimp Content Style Guide: Voice and Tone (canonical public guide)',url:'https://styleguide.mailchimp.com/voice-and-tone/'},{label:'Nielsen Norman Group (Kate Moran): the four dimensions of tone of voice',url:'https://www.nngroup.com/articles/tone-of-voice-dimensions/'},{label:'Nielsen Norman Group: the impact of tone of voice on brand perception (research)',url:'https://www.nngroup.com/articles/tone-voice-users/'},{label:'Mailchimp: 7 steps for establishing your voice and tone guidelines',url:'https://mailchimp.com/resources/establish-your-voice-and-tone/'},{label:'Slack Design: the voice of the brand — 5 principles for marketing copy',url:'https://slack.design/articles/thevoiceofthebrand-5principles/'},{label:'Intuit Content Design: Mailchimp voice and tone case study',url:'https://contentdesign.intuit.com/voice-tone/mailchimp/'}],
        notes:[{tone:'info',title:'Your brand is a character',paras:[['Think of your brand as a character in a book or TV show. The most memorable fictional characters have distinctive ways of speaking, yet can contribute to all sorts of conversations without ever losing their identity. Michael Scott from The Office and Sherlock Holmes from Arthur Conan Doyle\u2019s stories sound like no one else, in any scene you drop them into. This DOES matter: a recognizable voice is how your brand gets understood as a real player in the space you operate in, rather than blending into the wallpaper.']]}],
        related:['corestatement','styleguide','voc'] },

      { id:'pov', name:'Point of View (POV)', glyph:'13', category:'The Core', cat:'core',
        tagline:'A structured, defensible recommendation you put in front of a client or stakeholder.',
        visual:'Situation → Tension → Point of view → Evidence → The ask',
        summary:'A POV is more than a hot take. It turns analysis into a clear, committed recommendation. Rather than laying out options neutrally, it takes a position and defends it. The strongest POVs follow a narrative spine, Barbara Minto\u2019s SCQA (Situation, Complication, Question, Answer) or a simple Situation \u2192 Tension \u2192 Recommendation \u2192 Evidence \u2192 Ask, leading with the answer and then supporting it. It is how a strategist earns trust: not by having data, but by holding a position the data supports and stating exactly what they want the reader to do next.',
        whenToUse:['When a stakeholder or client needs a recommendation, not a menu of options to choose from.','When you have done the research and need to convert it into a decision someone will actually act on.'],
        links:[{label:'Reads to Leads, how to build a distinctive point of view',url:'https://www.readstoleads.com/blog-article/how-to-build-a-distinctive-pov'},{label:'Corporate Finance Institute, the SCQA framework',url:'https://corporatefinanceinstitute.com/resources/career/scqa/'},{label:'Wikipedia, Barbara Minto',url:'https://en.wikipedia.org/wiki/Barbara_Minto'},{label:'Barbara Minto, the Pyramid Principle concept',url:'https://www.barbaraminto.com/concept'}],
        related:['corestatement','mission','pillars'] },

      { id:'matrix', name:'Content Matrix / Content Map', glyph:'14', category:'Structure & Mapping', cat:'structure',
        tagline:'The grid: audience segment, funnel stage, format, and topic.',
        visual:'Audience × Stage × Format × Topic = Content plan',
        summary:'A content matrix intersects audience segments, funnel stages, content formats, and topics to reveal where assets exist and where they are missing. It is simultaneously a gap analysis tool, a planning scaffold, and a governance document, any piece added to the calendar should have a cell in the matrix. Teams that plan without a matrix tend to over-produce for one stage (usually awareness) and ignore the rest.',
        whenToUse:['When content planning happens by brainstorm rather than by systematically mapping what each audience needs at each stage.','To brief writers, designers, and agencies with structural context, not just a topic, but where it lives in the program at a glance.'],
        links:[{label:'Smart Insights, the Content Marketing Matrix (Dave Chaffey / Dan Bosomworth, origin)',url:'https://www.smartinsights.com/content-management/content-marketing-strategy/the-content-marketing-matrix-new-infographic/'},{label:'OpenView Labs, how to develop a content matrix step by step (Brandon Hickie)',url:'https://openviewpartners.com/blog/how-to-develop-a-content-matrix-a-step-by-step-guide/'},{label:'Inflow, the persona topic matrix template for content gap analysis',url:'https://www.goinflow.com/blog/persona-topic-matrix/'},{label:'HubSpot, how I use content mapping to personalize marketing (Stephanie Trovato)',url:'https://blog.hubspot.com/marketing/content-mapping-template-personalize-marketing'},{label:'SendPulse, how to create and use a content matrix (worked example)',url:'https://sendpulse.com/blog/content-matrix'},{label:'Miro, content planning matrix template (live, usable)',url:'https://miro.com/templates/content-planning-matrix/'}],
        related:['journey','clusters','channels'] },

      { id:'clusters', name:'Topic Clusters / Pillar Map', glyph:'15', category:'Structure & Mapping', cat:'structure',
        tagline:'A pillar page surrounded by interlinked cluster content for topical authority.',
        visual:'Pillar page → Cluster articles → Internal links → Topical authority',
        summary:"A topic cluster is an SEO structure in which a comprehensive pillar page covers a broad topic and links bidirectionally to deeper cluster articles on specific subtopics. Google's algorithms treat this architecture as a signal of topical authority. Beyond SEO, the structure forces a discipline of coverage, you must define exactly what sub-questions your pillar page owns before you can build its supporting content.",
        whenToUse:['When organic search is a core acquisition channel and topical authority matters for rankings.','When the content catalog is large but not structured, articles exist on all related topics but are not connected.','When planning a new content vertical from scratch, to map the full topic space before writing begins.'],
        links:[{label:'Moz, how to build blog topic clusters',url:'https://moz.com/blog/blog-topic-clusters'},{label:'Search Engine Land, the guide to topic clusters',url:'https://searchengineland.com/guide/topic-clusters'},{label:'Conductor, topic clusters guide',url:'https://www.conductor.com/academy/topic-clusters/'}],
        related:['pillars','matrix','keywords'] },

      { id:'keywords', name:'Keyword Map', glyph:'16', category:'Structure & Mapping', cat:'structure',
        tagline:'Assigns target keywords to specific pages so no two pages compete.',
        visual:'One keyword intent → One canonical page',
        summary:'A keyword map is a spreadsheet that assigns target keywords (and their intent categories) to specific pages, ensuring no two pages compete for the same query, a problem called keyword cannibalization. It also reveals which keywords have no page yet, feeding directly into a content production backlog. For established sites, the keyword map begins as a cleanup exercise; for new sites, it is a planning tool used before content is written.',
        whenToUse:['When organic rankings plateau despite publishing on relevant topics, often a sign of cannibalization.','When auditing a large site where page ownership and keyword targeting evolved without coordination.','Before publishing new content in a competitive category, to confirm a page for the target intent does not already exist.'],
        links:[{label:'Ahrefs, keyword mapping for SEO — how to do it + free template',url:'https://ahrefs.com/blog/keyword-mapping/'},{label:'Backlinko, keyword mapping — a step-by-step guide (+ free template)',url:'https://backlinko.com/keyword-mapping'},{label:'Search Engine Journal (Viola Eva), keyword mapping — a beginner\'s guide',url:'https://www.searchenginejournal.com/keyword-mapping-beginners-guide/466483/'},{label:'Search Engine Land, fix keyword cannibalization — identify and resolve SEO issues',url:'https://searchengineland.com/guide/keyword-cannibalization'},{label:'Semrush, keyword mapping for SEO — guide + free template',url:'https://www.semrush.com/blog/keyword-mapping/'}],
        related:['clusters','matrix','gap'] },

      { id:'model', name:'Content Model / Taxonomy', glyph:'17', category:'Structure & Mapping', cat:'structure',
        tagline:'A structured blueprint for content types, fields, and relationships.',
        visual:'Type + Fields + Relationships = Portable content',
        summary:'A content model defines the content types a system supports (Article, Author, Product, FAQ, etc.), the fields each type contains, and the relationships between them. Taxonomy extends this to the controlled vocabulary, tags, categories, and metadata schema, used to classify and retrieve content. Together, they are the architectural decisions that determine whether content can be reused across channels, migrated without loss, and discovered by both humans and algorithms.',
        whenToUse:['When designing or selecting a CMS, the content model determines what the system must be capable of expressing.','When the same content must render across multiple channels (web, app, voice, print) without manual reformatting.'],
        links:[{label:'Nielsen Norman Group, Taxonomy 101',url:'https://www.nngroup.com/articles/taxonomy-101/'},{label:"Ingeniux, the content manager's guide to taxonomy (PDF)",url:'https://info.ingeniux.com/hubfs/Resource%20Downloads/White%20Papers/Content%20Managers%20Guide%20to%20Taxonomy.pdf'}],
        related:['sitemap','styleguide','governance'] },

      { id:'calendar', name:'Editorial Calendar', glyph:'18', category:'Planning & Operations', cat:'planning',
        tagline:'The dated, assigned plan that turns strategy into a publishing schedule.',
        visual:'Topic / Format / Owner / Date',
        summary:'An editorial calendar assigns content ideas to specific dates, formats, owners, and channels. It is not a brainstorm list; it is a commitment document with accountable humans next to every row. The calendar\'s real value is forcing the conversation about capacity, most programs discover, when filling one out, that they have committed to more than they can produce. A realistic calendar is more useful than an aspirational one.',
        whenToUse:['When publishing is reactive, ideas are executed as they arise rather than planned for coverage and balance.','When social content managers "feel like they need a post for this week" or leaders ask "what are we doing for XYZ holiday."','To coordinate content releases with product launches, campaigns, seasonal moments, and external events.'],
        links:[{label:'CoSchedule, how to create a content marketing editorial calendar',url:'https://coschedule.com/content-marketing/editorial-calendar'},{label:'CMI (Jodi Harris), editorial calendar tools and templates',url:'https://contentmarketinginstitute.com/ai-content-creation-tools/editorial-calendar-tools-and-templates-to-help-you-master-your-content-to-do-list'},{label:'CMI (Kelsey Raymond), 7 steps to a more strategic editorial calendar',url:'https://contentmarketinginstitute.com/content-optimization/7-steps-to-a-more-strategic-editorial-calendar'},{label:'Tabitha Whiting, content calendar templates (Notion / Sheets / Excel)',url:'https://tabithawhiting.com/2024/11/05/content-calendar-templates/'},{label:'Amy Wright, how to build an editorial calendar — 5 examples',url:'https://amywright.me/how-to-build-an-editorial-calendar/'},{label:'Wikipedia, editorial calendar (origin and definition)',url:'https://en.wikipedia.org/wiki/Editorial_calendar'}],
        notes:[{tone:'warn',title:'An editorial calendar is NOT a content strategy',paras:[['The most common mistake in content execution is building an editorial calendar and then declaring, \u201cGreat, we have a content strategy now.\u201d You do not. An editorial calendar is NOT a content strategy.'],['It plans and documents the tactics that result from the strategy, which itself comes from your overall business goals. It bears repeating: an editorial calendar is NOT a content strategy. It does not dictate what should be done. It may be used as a plan, but it is not THE plan.'],['Furthermore, an editorial calendar is NOT a content strategy. Treat it as one and you drop your whole strategy ceiling down to knee-height.']]}],
        related:['pillars','workflow','brief'] },

      { id:'brief', name:'Content Brief', glyph:'19', category:'Planning & Operations', cat:'planning',
        tagline:'The per-piece spec that gives writers what they need before they start.',
        visual:'Audience / Goal / Angle / SEO target / Format / Length',
        summary:'A content brief is the document a writer receives before starting work, specifying the target audience and their question, the strategic goal of the piece, the angle or argument, any SEO targets, the format, required sources, and length guidelines. A good brief takes 30 minutes to write and saves hours of revision. Teams that brief poorly or not at all pay for it in rounds of feedback and rework.',
        whenToUse:['Any time a piece is handed from a strategist or editor to a writer, internal or external.','When onboarding freelancers or agencies who lack the context that full-time team members have implicitly.'],
        links:[{label:'CMI, a brief guide: how to write a brief (Daniel Hatch)',url:'https://contentmarketinginstitute.com/content-creation-distribution/a-brief-guide-how-to-write-a-brief'},{label:'CMI, how to develop a great creative brief and get on-target content',url:'https://contentmarketinginstitute.com/content-optimization/how-to-develop-a-great-creative-brief-and-get-on-target-content'},{label:'Orbit Media (Andy Crestodina), steal this content marketing template',url:'https://www.orbitmedia.com/blog/website-content-template/'},{label:'UpliftContent, 5 real content brief examples (Zapier, Wrike, PandaDoc, Meta)',url:'https://www.upliftcontent.com/blog/content-brief-template/'},{label:'Zapier, how to write a content brief (with template)',url:'https://zapier.com/blog/content-brief-template/'},{label:'Clearscope, what is a content brief and why it matters for SEO',url:'https://www.clearscope.io/blog/what-is-a-content-brief'},{label:'Ryan Robinson, free content brief template (Google Doc + Word)',url:'https://www.ryrob.com/content-brief-template/'}],
        notes:[{tone:'info',title:'No single template fits every brief',paras:[['A content brief can take a wide variety of forms, and it should. A good one reflects two things at once: the needs of the work\u2019s originators, the requesters, clients, and stakeholders who want the piece, and the input requirements of the people doing the work, the writers, designers, and other creators who have to act on it. The goal has already been decided upstream; the brief is marching orders for one very specific task, so let it carry exactly the detail that task requires and no more.']]}],
        related:['workflow','styleguide','calendar'] },

      { id:'workflow', name:'Content Workflow / Process Map', glyph:'20', category:'Planning & Operations', cat:'planning',
        tagline:'The defined stages a piece passes through from idea to published.',
        visual:'Plan / Brief → Create / Review / Publish / Distribute → Track KPIs ↺',
        summary:'A content workflow maps every stage in the production pipeline, the role responsible at each stage, the criteria for moving to the next, and any parallel review tracks (legal, brand, subject-matter expert). Making the workflow explicit surfaces where work actually stalls, usually review queues and approval gates, and gives everyone a shared vocabulary for discussing bottlenecks.',
        whenToUse:["When content gets stuck and no one can explain where, the piece is 'in review' with no accountable owner.",'To clarify role distinctions between writers, editors, subject matter experts, and approvers.','When scaling a content team or adding external contributors who lack institutional knowledge of the process.'],
        links:[{label:'Content Science Review, what is content workflow? (Colleen Jones)',url:'https://review.content-science.com/what-is-content-workflow/'},{label:'CMI, 5 steps to build a content operation workflow that helps everybody (Jodi Harris)',url:'https://contentmarketinginstitute.com/content-operations/5-steps-to-build-a-content-operation-workflow-that-helps-everybody'},{label:'Brain Traffic, new thinking on the Content Strategy Quad (workflow in process + governance)',url:'https://www.braintraffic.com/blog/new-thinking-brain-traffics-content-strategy-quad'},{label:'CoSchedule, editorial workflow checklist + template',url:'https://coschedule.com/blog/editorial-workflow-checklist-template'}],
        related:['raci','governance','calendar'] },

      { id:'raci', name:'RACI Matrix', glyph:'21', category:'Planning & Operations', cat:'planning',
        tagline:'Assigns Responsible, Accountable, Consulted, and Informed to every task.',
        visual:'Responsible / Accountable / Consulted / Informed',
        summary:'A RACI matrix maps roles to tasks across a workflow or governance plan. R (Responsible) does the work; A (Accountable) owns the outcome; C (Consulted) provides input before the decision; I (Informed) receives output after. The power is in the constraints: each task should have one A, not multiple. Where a matrix shows five As on a single task, the team has identified a clarity problem, and usually a bottleneck.',
        whenToUse:['When approval chains are slow or unclear, multiple stakeholders believe they hold veto power, or there is a sense of "hot potato" with an initiative.','When building a workflow from scratch and needing to assign explicit ownership before the process goes live.','In cross-functional programs where departments such as marketing, legal, brand, product, and comms all touch the same content.'],
        links:[{label:'Wikipedia, Responsibility Assignment Matrix (RACI origin, citing PMI/PMBOK)',url:'https://en.wikipedia.org/wiki/Responsibility_assignment_matrix'},{label:'Carrie Hane / Tanzen Consulting, how the RACI model helps get things done (RACI into content strategy via Halvorson)',url:'https://www.tanzenconsulting.com/blog/2017/6/1/how-the-raci-model-helps-get-things-done'},{label:'Content Strategy Inc., using a RACI chart to define content roles and responsibilities',url:'https://contentstrategyinc.com/how-to-use-a-raci-chart-to-define-content-roles-and-responsibilities/'},{label:'CMI (Ali Orlando Wert), unite roles and teams and scale your content operations',url:'https://contentmarketinginstitute.com/content-operations/how-to-unite-roles-and-teams-and-scale-your-content-operations'},{label:'Asana, free RACI matrix template + worked example',url:'https://asana.com/resources/raci-chart'},{label:'Atlassian Confluence, RACI chart template',url:'https://www.atlassian.com/software/confluence/templates/raci-chart'}],
        related:['workflow','governance','contributors'] },

      { id:'styleguide', name:'Editorial Style Guide', glyph:'22', category:'Planning & Operations', cat:'planning',
        tagline:'The rulebook for grammar, punctuation, terminology, and formatting.',
        visual:'One house rule beats a hundred editor debates.',
        summary:'An editorial style guide is the house rulebook for the small writing decisions teams keep arguing about: how you capitalize things, which punctuation you prefer, which words are approved or banned, how you write numbers and dates, and how links are handled. Settle each rule once, write it down, and writers and editors stop relitigating it on every piece. It is the practical partner to a voice and tone guide: voice and tone decide how the brand should sound, the style guide decides what is simply correct.',
        whenToUse:['When the same copyediting corrections recur across pieces, the same words are always changed by the same editor.','When scaling to multiple writers, external partners, or a global team where regional conventions vary.','Alongside a voice and tone guide, covering the mechanical layer the personality document leaves untouched.'],
        links:[{label:'Mailchimp Content Style Guide (full public example, CC-licensed)',url:'https://styleguide.mailchimp.com/'},{label:'18F Content Guide, U.S. federal government public style guide',url:'https://guides.18f.gov/content-guide/'},{label:'AP Stylebook, the default U.S. journalism/PR/marketing style authority',url:'https://www.apstylebook.com/'},{label:'The Chicago Manual of Style Online (University of Chicago Press)',url:'https://www.chicagomanualofstyle.org/'},{label:'Microsoft Writing Style Guide',url:'https://learn.microsoft.com/en-us/style-guide/welcome/'},{label:'CMI, style guide: how to write one for your brand (Sasha Laferte)',url:'https://contentmarketinginstitute.com/content-marketing-strategy/style-guide-how-to-write-one-for-your-brand'}],
        notes:[{tone:'info',title:'Why this is kept separate from voice and tone',paras:[['A style guide and a ',{t:'voice and tone guide',tool:'voicetone'},' answer different questions, which is why mature teams keep them in separate documents. Voice and tone govern character: the personality the brand projects, and how it flexes from a crisis note to a launch announcement. A style guide governs correctness: the mechanical, largely objective rules that are either followed or not. Mixing them buries debatable matters of personality inside a list of settled rules, and the two get revised on very different schedules, so splitting them keeps each document clean and easy to enforce.']]}],
        related:['voicetone','contributors','brief'] },

      { id:'contributors', name:'Contributor / Freelancer Guidelines', glyph:'23', category:'Planning & Operations', cat:'planning',
        tagline:'The document external writers and SMEs need to produce work that fits.',
        visual:'Context + Standards + Process = Usable first draft',
        summary:"A contributor guidelines document gives external writers, subject matter experts, and agency partners the context a full-time employee absorbs over months: the brand's purpose, the audience, the editorial standards, what topics are in and out of scope, the submission and revision process, and how payment or credit works. The investment in writing it once is paid back in every engagement that doesn't require a full briefing call and three rounds of foundational revision.",
        whenToUse:['When onboarding a new freelancer, agency, or SME contributor, before they write a single word.','When a brand has reached the point where most content is produced externally and internal editors are primarily curators.','When contributor quality is inconsistent and you need to raise the floor without expanding the full-time team.'],
        links:[{label:'CMI (Jodi Harris), outsourcing content creators — a how-to guide',url:'https://contentmarketinginstitute.com/content-optimization/outsourcing-content-creation-the-complete-how-to-guide'},{label:'CMI, writing guideline FAQs (CMI\'s own live contributor guidelines)',url:'https://contentmarketinginstitute.com/writing-guideline-faqs'},{label:'Orbit Media (Andy Crestodina), 9 editorial guidelines for your blog',url:'https://www.orbitmedia.com/blog/editorial-guidelines/'},{label:'Search Engine Journal (Maddy Osman), 8 must-haves in your content guidelines',url:'https://www.searchenginejournal.com/content-writing-guidelines/453914/'},{label:'Contently (Joni Sweet), how to onboard and work with freelance writers',url:'https://contently.com/2024/05/27/how-to-onboard-and-work-with-freelance-writers/'},{label:'Business2Community, contributor guidelines (live published example)',url:'https://www.business2community.com/contributor-guidelines/'}],
        notes:[{tone:'info',title:'Keep it short enough to actually read',paras:[['Keep this document concise. Its job is to get a freelancer or contributor productive fast, so the shorter and clearer it is, the better it onboards. Resist the urge to fold your entire ',{t:'editorial style guide',tool:'styleguide'},' into it, link to that as a reference piece instead, and let the guidelines themselves stay lean.']]}],
        related:['styleguide','raci','workflow'] },

      { id:'backlog', name:'Idea Backlog + Prioritization (RICE/ICE)', glyph:'24', category:'Planning & Operations', cat:'planning',
        tagline:'A scored list that ensures the highest-value content gets made first.',
        visual:'Reach × Impact × Confidence ÷ Effort = Priority score',
        summary:"An idea backlog is a running list of content concepts, each scored against a prioritization framework. RICE (Reach, Impact, Confidence, Effort) was developed at Intercom for product roadmapping and translates cleanly to content. The score is a starting point for judgment, not a replacement for it, a high-RICE piece with poor strategic timing or low team energy still requires a human call.",
        whenToUse:['When the content backlog is longer than realistic capacity and the team debates which ideas to prioritize.','When resources are constrained and making the case for investment requires showing expected return per piece.','When balancing quick wins (high RICE, low effort) against foundational assets (lower RICE, high strategic value).'],
        links:[{label:'Intercom (Sean McBride), RICE: simple prioritization for product managers (origin)',url:'https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/'},{label:'Lenny\'s Newsletter, interview with Sean Ellis on creating the ICE framework',url:'https://www.lennysnewsletter.com/p/the-original-growth-hacker-sean-ellis'},{label:'Product School, the RICE framework explained with a worked 3-project example',url:'https://productschool.com/blog/product-fundamentals/rice-framework'},{label:'Miro, RICE prioritization template (credits Intercom / Sean McBride)',url:'https://miro.com/templates/rice/'},{label:'CMI (Garrett Moon), how to brainstorm and prioritize your best content ideas (10x vs. 10%)',url:'https://contentmarketinginstitute.com/content-optimization/how-to-brainstorm-and-prioritize-your-best-content-ideas'}],
        related:['calendar','channels','kpi'] },

      { id:'channels', name:'Channel Strategy / Distribution Matrix', glyph:'25', category:'Planning & Operations', cat:'planning',
        tagline:'Defines which channels you publish to, and the strategic role of each.',
        visual:'Owned → Earned → Paid → Shared',
        summary:'A channel strategy assigns each distribution channel a purpose, a primary audience, a content format, and a success metric, preventing the mistake of posting the same thing everywhere and calling it distribution. The PESO model (Paid, Earned, Shared, Owned), created by Gini Dietrich, provides a useful taxonomy. For each channel the strategy answers: what does this channel do that others cannot, and what does success look like in 90 days?',
        whenToUse:["When a team posts to every platform reactively rather than strategically, the strategy is 'be everywhere.'",'When reporting shows high production volume but inconsistent reach, suggesting misalignment between content and channel fit.'],
        links:[{label:'Gini Dietrich / Spin Sucks, What Is the PESO Model (origin, from her 2014 book Spin Sucks)',url:'https://spinsucks.com/communication/peso-model-breakdown/'},{label:'AXIA PR, who really invented the PESO model? (Bartholomew 2010 vs. Dietrich)',url:'https://www.axiapr.com/blog/who-really-invented-the-peso-model'},{label:'CMI (Joe Pulizzi), 7 steps to creating your content marketing channel plan',url:'https://contentmarketinginstitute.com/content-distribution-promotion/7-steps-to-creating-your-content-marketing-channel-plan'},{label:'CMI (Jodi Harris), content distribution — the essential guide',url:'https://contentmarketinginstitute.com/content-distribution-promotion/how-to-create-a-better-distribution-plan-to-get-your-content-seen'},{label:'Ross Simmonds, the ultimate guide to content distribution',url:'https://rosssimmonds.com/blog/content-distribution-guide/'},{label:'Smart Insights, the Content Distribution Matrix (Dave Chaffey)',url:'https://www.smartinsights.com/content-management/content-marketing-strategy/content-distribution-matrix-infographic/'}],
        related:['matrix','repurposing','backlog'] },

      { id:'repurposing', name:'Repurposing / Atomization Matrix', glyph:'26', category:'Planning & Operations', cat:'planning',
        tagline:'Turns one pillar asset into its full ecosystem of smaller spinoffs.',
        visual:'One core asset → Many formats → Every channel',
        summary:'Content atomization starts with a high-investment pillar asset (a long-form report, video, or conference talk) and systematically derives every smaller asset it can yield: highlights, clips, carousels, email excerpts, quote graphics, and thread threads. The repurposing matrix maps which source asset generates which derived formats for which channels. Teams that plan repurposing upfront produce three to five times more distribution from the same production budget.',
        whenToUse:['When content production is high-effort but distribution is shallow, pieces are published once and forgotten.','Before producing an expensive asset (conference keynote, annual report), to plan how it will cascade into smaller formats.','When channel teams are bottlenecked on originals and a repurposing pipeline would unlock consistent publishing volume.'],
        links:[{label:'Jay Baer / Convince & Convert, 47 tactics to atomize your content (cites Todd Defren\'s original coinage)',url:'https://www.convinceandconvert.com/content-marketing/atomize-your-content-marketing/'},{label:'Jay Baer / Convince & Convert, how to reverse-atomize your content marketing',url:'https://www.convinceandconvert.com/content-marketing/reverse-atomize-your-content-marketing/'},{label:'GaryVee, the GaryVee content strategy: one keynote into 30+ pieces (reverse-pyramid model)',url:'https://garyvaynerchuk.com/the-garyvee-content-strategy-how-to-grow-and-distribute-your-brands-social-media-content/'},{label:'Ross Simmonds, what is content repurposing (repurpose / remix / reshare framework)',url:'https://rosssimmonds.com/blog/content-repurposing/'},{label:'CMI (Ann Gynn), 15+ ideas for remixing, recycling, and repurposing content',url:'https://contentmarketinginstitute.com/content-operations/remix-recycle-repurpose'},{label:'CMI (Nadya Khoja), 7 ways to repurpose content and grow your customer base',url:'https://contentmarketinginstitute.com/content-marketing-strategy/7-ways-to-repurpose-content-and-grow-your-customer-base'}],
        notes:[{tone:'warn',title:'What is the purpose of repurposing?',paras:[['Repurposing can be a sign of resourcefulness, getting more out of an asset you already invested in, but it can also (not always) be a sign that the original content strategy was insufficient. If you are squeezing extra deliverables out of a piece because nothing else was planned, you are introducing rework and scope creep, which is not the same thing as efficiency.'],['Ideally you plan for every asset a campaign should produce up front, in a ',{t:'Content Marketing Charter',tool:'charter'},' or a ',{t:'Content Brief',tool:'brief'},', depending on the scope of the outcome you want. Decide the full set of deliverables before production, not after.'],['This is a common social media practice, and it is usually the wrong place to drive it from. Social media managers should not be running atomization as a lateral pull system to fill air time; it is more efficient and more effective to plan for content to appear in every location it is needed from the start.']]}],
        related:['channels','matrix','calendar'] },

      { id:'governance', name:'Content Governance Plan', glyph:'27', category:'Planning & Operations', cat:'planning',
        tagline:'The long-term standards and ownership that keep content from decaying.',
        visual:'Who owns it / Who decides / When reviewed / When retired',
        summary:'Content governance is the system that determines how content decisions are made, who owns specific content areas, what standards new content must meet, and what happens to aging content over time. It is the infrastructure behind a program\'s quality, without it, content that was strategically sound at launch gradually drifts out of accuracy, brand alignment, and relevance. Governance is most urgently needed immediately after a migration or redesign.',
        whenToUse:['After a redesign or migration, to prevent the new content baseline from reverting to pre-redesign chaos.','When ownership and accountability for content are unclear at an organizational level.','When scheduling a formal content review cycle requires knowing who the accountable owners are across the estate.'],
        links:[{label:'Lisa Welchman, Managing Chaos: Digital Governance by Design (Rosenfeld Media, 2015)',url:'https://rosenverse.rosenfeldmedia.com/books/managing-chaos'},{label:'Lisa Welchman, what is digital governance? (strategy / policy / standards)',url:'https://www.lisawelchman.com/what-is-digital-governance/'},{label:'Kristina Halvorson (Brain Traffic), governance as an enterprise content strategy framework',url:'https://www.linkedin.com/posts/kristinahalvorson_i-have-been-trying-to-untangle-what-enterprise-activity-7169015868192927744-SD0D'},{label:'CMI (Marcia Riefer Johnston), the basics of digital governance (featuring Lisa Welchman)',url:'https://contentmarketinginstitute.com/strategy-planning/the-basics-of-digital-governance-what-content-marketers-need-to-know'},{label:'CMI (Erika Heald), content governance is a must for a successful content strategy',url:'https://contentmarketinginstitute.com/content-operations/content-governance-successful-strategy'},{label:'Nielsen Norman Group, content strategy: study guide (governance section)',url:'https://www.nngroup.com/articles/content-strategy-study-guide/'}],
        notes:[{tone:'warn',title:'Hitting publish is not the end',paras:[['Hitting Publish is not the finish line. Some content is evergreen, but most of it decays, slowly losing value until it actively works against your brand when a person reads it or a search or LLM crawler indexes it. A strong content governance effort is like pruning a tree to keep the whole orchard healthy, and it must be owned by judicious content managers, not left to rot. You would not leave a billboard up for a promotion that ended months ago; neither should dead digital content be free to cause confusion and negative SEO.']]}],
        related:['workflow','raci','lifecycle'] },

      { id:'kpi', name:'KPI / Measurement Framework', glyph:'28', category:'Measurement', cat:'measurement',
        tagline:'Connects what you track to the business outcomes that justify the work.',
        visual:'Activity → Engagement → Outcome → Business impact',
        summary:'A content measurement framework selects a small set of KPIs, fewer than seven, that form a logical chain from content activity (published pieces, traffic) through engagement (time on page, downloads) to outcomes (leads generated, pipeline influenced) to business impact (revenue attributed, cost savings from self-service). The discipline is choosing metrics that measure what matters, not what is easiest to pull from a dashboard. Vanity metrics belong in the appendix, if at all.',
        whenToUse:['When reporting shows volume of content produced but not the business impact of producing it.','When setting goals for a new or reset content program, to define what working means before execution begins.','When making the case for budget or headcount and needing to tie content to business language.'],
        links:[{label:'CMI: 5-Step Content Marketing Measurement Framework (Ann Gynn)',url:'https://contentmarketinginstitute.com/analytics-data/content-measurement-framework'},{label:'CMI: Content Measurement — The Essential Guide (Jodi Harris)',url:'https://contentmarketinginstitute.com/articles/how-measure-content-marketing-essential-guide/'},{label:'CMI: The Right and Wrong Ways to Use Vanity Metrics (Daniel Hochuli)',url:'https://contentmarketinginstitute.com/analytics-data/the-right-and-wrong-ways-to-use-vanity-metrics'},{label:'Avinash Kaushik: See-Think-Do — a content, marketing & measurement framework',url:'https://www.kaushik.net/avinash/see-think-do-content-marketing-measurement-business-framework/'},{label:'Avinash Kaushik: See-Think-Do-Care framework',url:'https://www.kaushik.net/avinash/see-think-do-care-win-content-marketing-measurement/'},{label:'HubSpot: KPI dashboards & how to use them (5 worked examples)',url:'https://blog.hubspot.com/marketing/kpi-dashboard'}],
        related:['charter','lifecycle','scorecard'] },

      { id:'lifecycle', name:'Content Lifecycle + Refresh Plan', glyph:'29', category:'Measurement', cat:'measurement',
        tagline:'Sets audit cadence, update triggers, and a sunset policy for aging content.',
        visual:'Create → Publish → Monitor → Refresh → Retire',
        summary:'A content lifecycle plan defines the phases a piece moves through after publication: active (performing), monitored (watched for decay), flagged for refresh (traffic or accuracy declining), refreshed (updated), or retired (removed or redirected). Without a lifecycle plan, content ages silently. With one, review triggers are defined in advance and the decision between refresh and retire becomes deliberate rather than a backlog of overdue maintenance.',
        whenToUse:['When a content audit reveals a large proportion of the catalog is outdated, underperforming, or actively misleading.','When establishing a governance model and needing operational procedures to accompany the ownership decisions.','When organic search performance for existing content is declining and a systematic refresh program is needed.'],
        links:[{label:'Ahrefs, what is content decay and how to fix it',url:'https://ahrefs.com/blog/content-decay/'},{label:'Animalz, content refresh strategy for SEO and AI search',url:'https://www.animalz.co/blog/content-refresh'},{label:'Animalz Revive, free tool to find and prevent content decay',url:'https://revive.animalz.co/'},{label:'Contentful, optimizing the content lifecycle (7-stage model)',url:'https://www.contentful.com/blog/content-lifecycle/'},{label:'Sanity, understanding the content lifecycle (glossary)',url:'https://www.sanity.io/glossary/content-lifecycle'},{label:'Content Marketing Institute, old content, new risk in the age of AI (Robert Rose)',url:'https://contentmarketinginstitute.com/content-operations/old-content-new-risk-ai'}],
        notes:[{tone:'info',title:'Lifecycle vs. governance: what is the difference?',paras:[['It is easy to confuse this with a ',{t:'Content Governance Plan',tool:'governance'},', but they operate at different levels. Governance is the standing system of ownership, standards, and authority: who decides, who owns what, and what every piece must live up to. The content lifecycle is the operational path a single piece travels after publication, active, monitored, flagged for refresh, refreshed, or retired, and the triggers that move it between those states. Governance sets the rules; the lifecycle is the recurring maintenance those rules call for.']]}],
        related:['audit','kpi','governance'] },

      { id:'scorecard', name:'Content Quality Scorecard', glyph:'30', category:'Measurement', cat:'measurement',
        tagline:'A pre-publish rubric that removes vibes from the quality decision.',
        visual:'Accuracy / Clarity / Relevance / Completeness / Brand fit',
        summary:'A quality scorecard is a rubric applied to each piece before publication, typically scoring four to eight dimensions (accuracy, clarity, audience relevance, brand alignment, SEO fundamentals, completeness) on a defined scale. Its purpose is to make quality assessment explicit and consistent so it is not a function of reviewer personality or available time. Teams that use one stop publishing mediocre content accidentally.',
        whenToUse:['When post-publication quality is inconsistent, some pieces are excellent, many are just acceptable, and no one can explain why.','When scaling content production with new writers or external contributors who are not yet calibrated.','When a content program is maturing and the question shifts from "are we publishing enough?" to "is what we publish good?"'],
        links:[{label:'Google, Search Quality Rater Guidelines (official PDF, E-E-A-T framework)',url:'https://guidelines.raterhub.com/searchqualityevaluatorguidelines.pdf'},{label:'Google Search Central, quality rater guidelines — E-A-T gets an extra E for Experience',url:'https://developers.google.com/search/blog/2022/12/google-raters-guidelines-e-e-a-t'},{label:'Content Science / Colleen Jones, what is content quality?',url:'https://review.content-science.com/what-is-content-quality/'},{label:'CMI (Lindy Roux / Tendo), how to build a scorecard to measure content marketing effectiveness',url:'https://contentmarketinginstitute.com/content-distribution-promotion/how-to-build-a-scorecard-to-measure-content-marketing-effectiveness'},{label:'CMI, how to set up a content scoring process',url:'https://contentmarketinginstitute.com/analytics-data/how-to-set-up-a-content-scoring-process-for-better-decisions'},{label:'Content Strategy Inc., how to use a content scorecard',url:'https://contentstrategyinc.com/how-to-use-a-content-scorecard/'}],
        notes:[{tone:'info',title:'Who should fill one out?',paras:[['Who should perform a content quality scorecard? Marketing experts and reviewers with deep knowledge of content mechanics, writing, usability, branding, UX, and the customer\u2019s perspective. Scoring quality is inherently subjective, so it should be done by people whose judgment is worth trusting, not handed to whoever happens to be free.']]}],
        related:['brief','styleguide','kpi'] },

      { id:'sitemap', name:'Information Architecture / Sitemap', glyph:'31', category:'Information Architecture', cat:'ia',
        tagline:'How content is structured, labeled, and navigated across a site.',
        visual:'Structure / Labels / Navigation / Findability',
        summary:'Information architecture (IA) is the practice of organizing, structuring, and labeling content so users can find what they need and understand where they are. For a web project, the sitemap is the IA deliverable: a hierarchical diagram of pages, sections, and navigation paths. Good IA is invisible to users, they simply find what they need without noticing the decisions that made it possible. Bad IA makes people feel lost in a space built to help them.',
        whenToUse:['Before any website build, redesign, or migration, IA decisions made after development is underway are expensive to change.','When analytics show high bounce rates or low pages-per-session, suggesting users cannot find related content.','When multiple product lines, audience segments, or business units share a single site and their content needs to coexist.'],
        links:[{label:'Nielsen Norman Group, Information Architecture: Study Guide',url:'https://www.nngroup.com/articles/ia-study-guide/'},{label:'Nielsen Norman Group, Information Architecture vs. Sitemaps: what\'s the difference?',url:'https://www.nngroup.com/articles/information-architecture-sitemaps/'},{label:'Rosenfeld, Morville & Arango, Information Architecture: For the Web and Beyond (the "polar bear book")',url:'https://www.oreilly.com/library/view/information-architecture-4th/9781491913529/'},{label:'Abby Covert, How to Make Sense of Any Mess (free online book)',url:'https://www.howtomakesenseofanymess.com/'},{label:'Nielsen Norman Group (Jakob Nielsen), Site Map Usability — two usability studies',url:'https://www.nngroup.com/articles/site-map-usability/'},{label:'Abby Covert, What Do We Mean? (unpacking the definition of IA)',url:'https://abbycovert.com/writing/what-do-we-mean/'}],
        related:['model','cardsort','matrix'] },

      { id:'cardsort', name:'Card Sorting', glyph:'32', category:'Information Architecture', cat:'ia',
        tagline:'A research method for learning how users actually treat your content.',
        visual:'Users group cards → Patterns emerge → Information architecture reflects mental models',
        summary:'Card sorting is a research method in which participants group labeled cards (each representing a piece of content or a topic) into categories that make sense to them, and optionally name those categories. The patterns reveal how users actually think about and organize information, which often differs meaningfully from how the organization thinks about it. Open sorts are used when designing navigation from scratch; closed sorts validate or challenge an existing structure.',
        whenToUse:['Before finalizing a website navigation structure, to validate that category labels reflect how users think, not how the brand thinks.','When a navigation redesign reveals internal disagreement about what belongs where, card sort data resolves the argument with evidence.','After a significant expansion of the content catalog, to determine whether the existing structure still works for a larger content set.'],
        links:[{label:'Nielsen Norman Group, Card Sorting definition and method',url:'https://www.nngroup.com/articles/card-sorting-definition/'},{label:'User Interviews, card sorting field guide',url:'https://www.userinterviews.com/ux-research-field-guide-chapter/card-sorting'}],
        related:['sitemap','persona','matrix'] }
    ];

window.FAQ_ITEMS = [
          { q: 'Who should use this library?', a: 'Content strategists, individual marketers who\'ve inherited strategy work, founders, product managers, UX designers, anyone wearing a "strategy hat," whether permanently or temporarily. If you work with an agency on content strategy, this library will help you speak the language fluently enough to recognize real strategy when you see it, and to know when you\'re not getting it.' },
          { q: 'Can I do content strategy myself, or do I need to hire a dedicated strategist or agency?', a: 'You can do meaningful content strategy yourself, especially at an early stage or with a focused program. The tools here exist to give you the same frameworks professionals use. That said, there is a difference between running a structured strategy and having someone whose full-time job is to maintain and evolve it. Start with the Charter and Mission Statement to get aligned, then the Persona and Journey Map to understand your audience. If your content is already driving real business results and you\'re growing fast, a dedicated strategist will compound those results significantly.' },
          { q: 'Isn\'t content strategy just having a content calendar?', a: 'A content calendar tells you when to attack. Content strategy tells you why, who you\'re fighting for, and what winning looks like. Think of it like a military campaign: the calendar is the schedule of operations. Content strategy is the full battle plan, the intelligence, the objectives, the logistics, the contingencies, the definition of victory. Executing a calendar without the strategy underneath it is movement without direction.' },
          { q: 'Can\'t my content writers do my content strategy for me?', a: 'Not without doing different work than they were hired to do. Content writers are trained to execute: find the right words for a brief, adapt a tone, make an argument land. Content strategy is upstream of all that, it determines what gets written, for whom, in what order, and toward what end. Asking your writers to own the strategy is like asking your chef to redesign the menu concept, source the suppliers, and decide who the restaurant is for. Some can do it. Most weren\'t hired for it, and it competes directly with what they were hired to do.' },
          { q: 'Can\'t my AI do my content strategy for me?', a: 'Generative AI is an imitation engine. It excels at producing plausible sequences of words based on what has been said before, and "what has been said before" is the average, the consensus, the already-competed terrain. That is the opposite of what strategy should do. Strategy is about asymmetric advantage: finding the position, the voice, the angle your competitors have not taken. AI will sand off the edges of your thinking the same way it does for copy and imagery, producing something competent, broadly acceptable, and indistinguishable from everyone else doing the same thing. Use AI to execute strategy. Use a human brain to make it.' },
          { q: 'My agency is very expensive and I think they\'re just giving me AI answers. How do I transition to in-house content strategy?', a: 'Start by getting clear on what real strategic work looks like versus what can be templated or automated. A rigorous agency should be doing original audience research, making real positioning calls, and building frameworks that compound over time, not generating briefs from prompts and calling it strategy. If that is what you are paying for, the transition starts with this library: learn the tools, run a content audit, write your own charter and mission statement. Once you can evaluate strategy quality yourself, you can decide whether to hire a dedicated strategist, find a more rigorous partner, or run it in-house.' },
          { q: 'How do I know if my content strategy is working?', a: 'When the business goal you defined before you started moves in the right direction, not a content metric. Traffic, shares, and engagement tell you content is being consumed. Revenue influenced, pipeline generated, retention improved, or sales cycle shortened tell you the strategy is working. If you did not define a business goal before building the strategy, that is step one. The KPI Framework in this library walks through building a measurement chain from content activity to business outcome.' },
          { q: 'Can I use the tools and frameworks on this site for free?', a: 'Yes, use whatever you find here. The frameworks are collected from public sources and credited throughout. Please credit the original creators when you share or adapt their work; attribution matters, and most of these frameworks have named originators who deserve the recognition.' },
          { q: 'Is a well-documented go-to-market campaign the same as a content strategy?', a: 'No, but they are related. A go-to-market plan is a time-bounded execution strategy for launching something. A content strategy is the ongoing system that determines what you create, for whom, and why, across all time, not just launches. A GTM campaign can live inside a content strategy, or a content strategy can inform a GTM campaign. But one does not substitute for the other.' }
        ];

window.WIZARD = {
  questions: [
    'Where does your content program stand right now?',
    'What is your single biggest pain point?',
    'What do you most need to walk away with?'
  ],
  subtitles: [
    'Be honest. We will point you toward the tools that help most from here.',
    'Pick the one that is costing you the most right now.',
    'Think about what your team would actually act on this week.'
  ],
  options: [
    [
      { id: 'start',     label: 'We are just getting started' },
      { id: 'unplanned', label: 'We have content but it grew without a plan' },
      { id: 'broken',    label: 'We have a strategy but results are disappointing' },
      { id: 'scaling',   label: 'We are growing and need more structure and process' }
    ],
    [
      { id: 'audience',    label: 'I do not know enough about my audience' },
      { id: 'message',     label: 'Our content has no consistent voice or message' },
      { id: 'execution',   label: 'Things fall through the cracks in production' },
      { id: 'measure',     label: 'I cannot tell whether any of it is working' },
      { id: 'findability', label: 'Our content is hard to find on our website' },
      { id: 'topics',      label: 'We are covering the wrong topics or missing obvious ones' }
    ],
    [
      { id: 'doc',         label: 'A strategy document to align the team' },
      { id: 'plan',        label: 'A clear plan for what to make and when' },
      { id: 'process',     label: 'Better systems for our production process' },
      { id: 'measurement', label: 'A way to measure and report on results' },
      { id: 'structure',   label: 'A better-organized website or content structure' }
    ]
  ],
  scores: {
    start:       { charter:3, mission:3, pillars:2, persona:2, jtbd:1 },
    unplanned:   { audit:3, gap:2, swot:2, corestatement:2, charter:1 },
    broken:      { kpi:3, voc:2, audit:2, lifecycle:2, scorecard:2 },
    scaling:     { governance:3, raci:3, workflow:2, contributors:2, styleguide:1 },
    audience:    { persona:3, journey:3, jtbd:3, voc:2 },
    message:     { corestatement:3, voicetone:3, pillars:2, mission:2 },
    execution:   { workflow:3, raci:3, brief:2, backlog:2, calendar:1 },
    measure:     { kpi:3, scorecard:3, lifecycle:2 },
    findability: { sitemap:3, cardsort:3, model:2 },
    topics:      { clusters:3, keywords:3, gap:2, matrix:2 },
    doc:         { charter:3, mission:3, corestatement:2, pillars:2 },
    plan:        { calendar:3, matrix:3, brief:2, clusters:2 },
    process:     { workflow:3, raci:2, brief:2, backlog:2, governance:1 },
    measurement: { kpi:3, scorecard:3, lifecycle:2 },
    structure:   { sitemap:3, cardsort:3, model:2 }
  }
};

window.SUBMIT_CATEGORIES = [
  ['strategy', 'Strategy & Foundation'],
  ['discovery', 'Discovery'],
  ['audience', 'Audience'],
  ['core', 'The Core'],
  ['structure', 'Structure & Mapping'],
  ['planning', 'Planning & Operations'],
  ['measurement', 'Measurement'],
  ['ia', 'Information Architecture'],
  ['other', 'Other / Not sure']
];

/* ── Workspace accent palette (brand-your-export color choices) ── */
window.ACCENT_CHOICES = [
  { hex: '#F7C531', name: 'Library gold' },
  { hex: '#2563EB', name: 'Blue' },
  { hex: '#0E9F6E', name: 'Green' },
  { hex: '#F0653E', name: 'Coral' },
  { hex: '#7C3AED', name: 'Purple' },
  { hex: '#334155', name: 'Slate' }
];

window.TERMINOLOGY = [
      { term:'Content Strategy',
        defs:[
          { text:'Planning for the creation, publication, and governance of useful, usable content.', by:'Kristina Halvorson, founder & CEO of Brain Traffic, the widely cited foundational definition.' },
          { text:'Content strategists use words and data to create unambiguous content that supports meaningful, interactive experiences.', by:'Rachel Lovinger, experience director at Razorfish, adding emphasis on data and interactive experiences.' },
          { text:'A high-level plan that guides the intentional creation and maintenance of information in a digital product.' }
        ],
        sources:['https://en.wikipedia.org/wiki/Content_strategy','https://www.braintraffic.com/blog/what-is-content-strategy','https://www.nngroup.com/articles/content-strategy/','https://bussolati.com/contentstrategy-definition/','https://www.jonathoncolman.org/2013/02/04/content-strategy-resources/','https://alistapart.com/article/thedisciplineofcontentstrategy/'] },

      { term:'Content Audit',
        defs:[{ text:'The process of judging existing content to determine what needs to be created, updated, or removed, a systematic review and analysis of all content within an organization, like an inventory check.' }],
        sources:['https://www.sanity.io/glossary/content-auditing','https://tendocom.com/glossary/content-model/','https://web.tamu.edu/aggie-ux-university/defining-and-organizing-your-sites-content/ux-research-methods/content-inventory-and-co'] },

      { term:'Content Model',
        defs:[{ text:'A visual representation of the way content should be structured on a webpage, a planning tool used at the outset of a project to guide wireframing, design, and content creation. Content modeling defines the structure and organization of content at a granular level: identifying content types, fields, and relationships.' }],
        sources:['https://tendocom.com/glossary/content-model/','https://www.contentstack.com/academy/courses/content-modeling/understanding-content-modeling'] },

      { term:'Content Governance',
        defs:[{ text:'The process of planning, creating, managing, and enforcing policies and guidelines for creating, publishing, and maintaining digital content, the set of rules that ensure accuracy, consistency, quality, and compliance.' }],
        sources:['https://www.simpplr.com/glossary/content-governance/','https://www.bynder.com/en/glossary/content-governance/'] },

      { term:'Editorial Calendar',
        defs:[{ text:'A strategic tool used by marketers and content creators to plan and organize content creation and publication schedules. It is primarily concerned with the logistics of publishing: scheduling and coordinating with team members.' }],
        sources:['https://www.business.reddit.com/marketing-glossary/editorial-calendar','https://nytlicensing.com/latest/marketing/editorial-content-calendar-vs-content-strategy/'] },

      { term:'Topic Cluster',
        defs:[{ text:'A group of related pages built around one central subject. Starting with a core topic, you build one main pillar page covering it broadly, then create supporting pages on related subtopics that link back to the pillar.' }],
        sources:['https://www.jumpfly.com/blog/seo-content-strategy-how-to-build-a-winning-topic-cluster/','https://blog.marketmuse.com/what-are-topic-clusters/'] },

      { term:'Persona', alt:'Content persona',
        defs:[{ text:'Fictional characters built from information about the target group. They represent existing or future customers and give the target group a human face. In product management, a persona is a profile of a typical customer used to understand key traits, behaviors, goals, and needs.' }],
        sources:['https://www.textbroker.com/personas','https://www.productplan.com/glossary/persona'] },

      { term:'Content Style Guide',
        defs:[{ text:"Documents a brand's voice, tone, and style choices so writers can communicate consistently across product and channels, mapping out how you communicate with your audience, covering grammar, punctuation, voice, and tone." }],
        sources:['https://www.frontitude.com/glossary-posts/what-is-a-content-style-guide','https://www.visiblethread.com/blog/what-is-a-style-guide-and-why-is-it-important-for-your-organization/'] },

      { term:'Content Lifecycle',
        defs:[{ text:'A comprehensive process that guides digital content from its inception to its eventual archiving or deletion. It spans the phases of Planning, Creating, Managing, Distributing, Optimizing, and Preserving.' }],
        sources:['https://www.sanity.io/glossary/content-lifecycle','https://www.acquia.com/glossary/content-lifecycle'] },

      { term:'Pillar Page',
        defs:[{ text:'A type of web content that provides high-level information on a broad topic while strategically linking to more specific content pieces. It covers a broad topic in depth on a single page, with detailed related content on linked blogs forming content clusters.' }],
        sources:['https://www.saltedstone.com/blog/content-strategy-101-pillar-pages-and-topic-clusters','https://www.smamarketing.net/glossary/what-is-a-pillar-page'] },

      { term:'Keyword Research',
        defs:[{ text:'The SEO practice of finding, analyzing, and using the phrases people use to search for information online, identifying and analyzing the terms and queries people use when searching for information, products, or services.' }],
        sources:['https://mangools.com/blog/keyword-research/','https://www.conductor.com/academy/keyword-research/'] },

      { term:'Content Marketing ROI', alt:'Content ROI',
        defs:[{ text:'The measurement of return on investment for content marketing efforts, judged against benchmarks like website visits, email subscriptions, and social media followers. Calculated by dividing the net income generated from a content campaign by the cost of the campaign.' }],
        sources:['https://stephenjeske.ca/content-strategy-glossary/content-marketing-roi/','https://www.jasper.ai/blog/content-marketing-roi'] },

      { term:'Voice',
        defs:[{ text:"The brand's unique personality and core beliefs. Brand voice guidelines are the rules that help a company sound consistent and true to its personality across all communications." }],
        sources:['https://www.linkedin.com/top-content/marketing/brand-building-essentials/brand-voice-and-tone-guidelines/','https://www.rtfct.com/glossary/tone-of-voice'] },

      { term:'Tone',
        defs:[{ text:"How the brand adjusts communication to match context and audience while keeping the core voice steady. Tone reflects the brand's personality, values, and the emotions it evokes." }],
        sources:['https://www.linkedin.com/top-content/marketing/brand-building-essentials/brand-voice-and-tone-guidelines/','https://www.rtfct.com/glossary/tone-of-voice'] },

      { term:'Content Distribution',
        defs:[{ text:'Sharing, publishing, and promoting content across various channels to reach a broader audience, distributing articles, videos, and infographics through social media, email newsletters, websites, and third-party platforms.' }],
        sources:['https://www.zinfi.com/glossary/what-is-content-distribution/','https://www.verblio.com/definer/content-distribution'] },

      { term:'SMART Goals',
        defs:[{ text:'An acronym for Specific, Measurable, Achievable, Relevant, and Time-bound, a way of setting objectives that are clear, measurable, and achievable.' }],
        sources:['https://asana.com/resources/smart-goals','https://www.atlassian.com/blog/productivity/how-to-write-smart-goals'] },

      { term:'Content Mission Statement',
        defs:[{ text:"A brief expression of a piece of content's core objectives and goals. It explains why you do what you do, content-wise, addressing who you speak to, what you offer, and why customers should care." }],
        sources:['https://www.salsify.com/glossary/content-mission-statement-meaning','https://www.acquia.com/blog/how-to-craft-a-winning-content-mission-statement'] },

      { term:'Topical Authority',
        defs:[{ text:'How well a website covers a specific subject with thorough, reliable, high-quality content, demonstrating expertise in a particular subject area.' }],
        sources:['https://www.clearscope.io/blog/topical-authority','https://www.pnclogos.com/topical-authority-vs-keyword-targeting/'] },

      { term:'Content Framework',
        defs:[{ text:'A structured workflow for how you plan, produce, and distribute content. It outlines what you are creating, who it is for, and documents the entire process.' }],
        sources:['https://www.siteimprove.com/blog/content-strategy-framework/'] },

      { term:'Unique Content',
        defs:[{ text:'Original content that offers its own perspective, structure, wording, examples, or insights instead of repeating what already exists elsewhere. In SEO, it means content that is original and not duplicated anywhere else.' }],
        sources:['https://www.clickworker.com/content-marketing-glossary/unique-content/','https://www.textbroker.com/unique-content'] },

      { term:'Content Strategy Framework',
        defs:[{ text:'A structured workflow for how you plan, produce, and distribute content, outlining what you create, who it is for, and the entire process from ideation to publication and promotion.' }],
        sources:['https://www.siteimprove.com/blog/content-strategy-framework/'] },

      { term:'UX', alt:'User experience',
        defs:[{ text:'How a person feels when interacting with a system, product, or service. In content strategy, UX focuses on creating meaningful, interactive experiences for users through unambiguous content.' }],
        sources:['https://www.nngroup.com/articles/content-strategy/'] },

      { term:'SEO', alt:'Search engine optimization',
        defs:[{ text:'The practice of optimizing content to rank higher in search engine results, making it more visible to people searching for relevant information. Keyword research and topic clusters are core SEO strategies in content strategy.' }],
        sources:['https://mangools.com/blog/keyword-research/','https://blog.marketmuse.com/what-are-topic-clusters/'] },

      { term:'Target Audience',
        defs:[{ text:'The specific group of people most likely to benefit from or be interested in your content, product, or service, defined by shared characteristics such as demographics, behaviors, needs, and goals. Content strategy starts by identifying and understanding the target audience.' }],
        sources:['https://www.textbroker.com/personas','https://www.productplan.com/glossary/persona'] },

      { term:'Pain Points',
        defs:[{ text:'Specific problems, challenges, or frustrations that your target audience experiences, the issues your content aims to solve. Identifying pain points helps create relevant, valuable content that resonates with readers and drives engagement.' }],
        sources:['https://www.textbroker.com/personas','https://www.productplan.com/glossary/persona'] },

      { term:'GEO', alt:'Generative Engine Optimization',
        defs:[{ text:'Optimizing content for LLM-powered platforms like AI chatbots and generative search, structuring content so it is easily understood, cited, and surfaced by AI systems when answering user queries. Sometimes called AEO (AI Engine Optimization) or optimization for AI Overviews.' }],
        sources:['https://www.clearscope.io/blog/topical-authority','https://www.jumpfly.com/blog/seo-content-strategy-how-to-build-a-winning-topic-cluster/'] },

      { term:'Content Repurposing',
        defs:[{ text:'Taking existing content and adapting it for different formats, channels, or audiences, turning a blog post into a video, extracting social snippets from a webinar, or building an infographic from a data report. Repurposing extends content value, saves production time, and reaches audiences on different platforms.' }],
        sources:['https://www.zinfi.com/glossary/what-is-content-distribution/','https://www.verblio.com/definer/content-distribution'] },

      { term:'KPIs', alt:'Key Performance Indicators',
        defs:[{ text:'Measurable metrics used to track the success of a content strategy against specific goals, website traffic, engagement, conversion rates, search rankings, social shares, email subscriptions, and content marketing ROI. KPIs should align with SMART goals to provide clear, actionable insights.' }],
        sources:['https://asana.com/resources/smart-goals','https://www.jasper.ai/blog/content-marketing-roi'] }
    ];


/* Friendly source labels used by the terminology view. */
window.SOURCE_NAMES = {
      'en.wikipedia.org':'Wikipedia','braintraffic.com':'Brain Traffic','nngroup.com':'Nielsen Norman Group',
      'bussolati.com':'Bussolati','jonathoncolman.org':'Jonathon Colman','alistapart.com':'A List Apart',
      'sanity.io':'Sanity','tendocom.com':'Tendo','tamu.edu':'Texas A&M University','contentstack.com':'Contentstack',
      'simpplr.com':'Simpplr','bynder.com':'Bynder','reddit.com':'Reddit for Business','nytlicensing.com':'NYT Licensing',
      'jumpfly.com':'JumpFly','marketmuse.com':'MarketMuse','textbroker.com':'Textbroker','productplan.com':'ProductPlan',
      'frontitude.com':'Frontitude','visiblethread.com':'VisibleThread','acquia.com':'Acquia','saltedstone.com':'Salted Stone',
      'smamarketing.net':'SMA Marketing','mangools.com':'Mangools','conductor.com':'Conductor','stephenjeske.ca':'Stephen Jeske',
      'jasper.ai':'Jasper','linkedin.com':'LinkedIn','rtfct.com':'RTFCT','zinfi.com':'ZINFI','verblio.com':'Verblio',
      'asana.com':'Asana','atlassian.com':'Atlassian','salsify.com':'Salsify','clearscope.io':'Clearscope',
      'pnclogos.com':'PNC Digital','siteimprove.com':'Siteimprove','clickworker.com':'clickworker'
    };
