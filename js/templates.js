/* ============================================================
   Content Strategy Library — downloadable template generators
   Ported verbatim (as a class) from the Claude Design handoff.
   Client-side document generation via docx, pdf-lib, xlsx (SheetJS),
   and PptxGenJS — all loaded from CDN in index.html.
   Public API: window.CSLTemplates.templateVals(id) and .downloadTemplate(id, fmt).
   ============================================================ */
(function () {
  class CSLTemplates {
    constructor() {
      this.props = {
        libraryUrl: (location.origin && location.origin !== 'null')
          ? (location.origin + location.pathname)
          : ''
      };
    }

  tplMark() { return 'Content Strategy Library'; }
  tplCreditRest() { return 'Template, free to use and adapt'; }
  tplUrl() { return (this.props.libraryUrl || 'https://your-content-strategy-library.com').replace(/\/+$/, ''); }
  tplCredit() { return this.tplMark() + '   ' + this.tplUrl(); }

  // Shared brand footer for downloadable templates: a miniature yellow
  // mark, the wordmark, and a clickable library URL. No "Created by".
  pdfBrandFooter(doc, page, PL, helv, bold, M, GRAY) {
    const { rgb, PDFName, PDFString } = PL;
    const y = 26, sq = 8.5;
    page.drawRectangle({ x: M, y: y - 1, width: sq, height: sq, color: rgb(0.969, 0.773, 0.192) });
    const mx = M + sq + 6;
    page.drawText(this.tplMark(), { x: mx, y, size: 8, font: bold, color: GRAY });
    const url = this.tplUrl();
    const ux = mx + bold.widthOfTextAtSize(this.tplMark(), 8) + 12;
    page.drawText(url, { x: ux, y, size: 8, font: helv, color: GRAY });
    const uw = helv.widthOfTextAtSize(url, 8);
    try {
      const annot = doc.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [ux, y - 2, ux + uw, y + 9], Border: [0, 0, 0], A: doc.context.obj({ Type: 'Action', S: 'URI', URI: PDFString.of(url) }) });
      const ref = doc.context.register(annot);
      const cur = page.node.Annots();
      if (cur) cur.push(ref); else page.node.set(PDFName.of('Annots'), doc.context.obj([ref]));
    } catch (e) { /* link annotation optional */ }
  }
  docxBrandFooter(d) {
    const { Paragraph, TextRun, ExternalHyperlink, ShadingType } = d;
    const FONT = 'Arial', GRAY = '6B6A5E', HL = 'F7C531';
    const url = this.tplUrl();
    return new Paragraph({ spacing: { before: 400 }, children: [
      new TextRun({ text: '  ', size: 16, shading: { type: ShadingType.CLEAR, fill: HL } }),
      new TextRun({ text: '  ' + this.tplMark() + '      ', size: 16, font: FONT, color: GRAY, bold: true }),
      new ExternalHyperlink({ link: url, children: [new TextRun({ text: url, size: 16, font: FONT, color: GRAY, underline: {} })] })
    ] });
  }

  // Spec-driven templates for every other tool.
  // Doc-type: formats docx + pdf, built from sections (f = fields, grid = 2-across boxes, t = table).
  // Sheet-type: formats xlsx + pdf, built from an xlsx column spec.
  tplSpecs() {
    return {
      charter: { title: 'Content Marketing Charter', file: 'content-charter', formats: ['docx', 'pdf'],
        intro: 'The one-page master strategy. If it does not fit on a page, it is not yet a strategy.',
        notes: ['Purpose, audience, pillars, and KPIs on a single master page.', 'The PDF has type-into form fields and prints on standard letter paper.'],
        sections: [
          { h: 'Purpose', f: [
            ['Why we make content', 'The business reason this program exists, in plain language.', 2],
            ['Business goals it supports', 'The company objectives content is accountable to.', 3],
            ['What success looks like', 'The outcome in 12 months, stated so anyone could verify it.', 2] ] },
          { h: 'Audience', f: [
            ['Primary audience', 'Who this program serves: role, situation, seniority.', 2],
            ['Problems we address for them', 'The pains and questions our content exists to resolve.', 3] ] },
          { h: 'Editorial commitments', f: [
            ['Content pillars / themes', 'The three to five territories we commit to owning.', 3],
            ['Formats and channels', 'What we make and where it lives.', 2],
            ['Cadence', 'A realistic publishing rhythm the team can sustain.', 1] ] },
          { h: 'Measurement and ownership', f: [
            ['KPIs', 'The handful of metrics that prove the goals above.', 3],
            ['Program owner', 'The one person accountable for this charter.', 1],
            ['Review cadence', 'When this charter gets revisited and by whom.', 1] ] }
        ] },
      mission: { title: 'Editorial Mission Statement', file: 'editorial-mission', formats: ['docx', 'pdf'],
        intro: 'One sentence: the audience you serve, what they achieve, and the content you provide.',
        notes: ['Builds the sentence part by part, then stress-tests it against real pieces.'],
        sections: [
          { h: 'The three parts', f: [
            ['Audience: who we serve', 'Be narrower than feels comfortable.', 1],
            ['Outcome: what they achieve', 'The result they get from our content, not from our product.', 1],
            ['Content: what we provide', 'The type and character of content that delivers the outcome.', 1] ] },
          { h: 'The assembled statement', f: [
            ['We help [audience] achieve [outcome] by providing [content].', 'Write the full sentence. Rework it until every word earns its place.', 2] ] },
          { h: 'Stress test', f: [
            ['A recent piece that fits, and why', 'Prove the statement describes what you actually publish.', 2],
            ['A recent piece that fails, and what to do', 'The statement is only useful if it can say no.', 2] ] }
        ] },
      pillars: { title: 'Content Pillars / Themes', file: 'content-pillars', formats: ['docx', 'pdf'],
        intro: 'The three to five durable themes that organize everything you publish. Commit, and cut the rest.',
        notes: ['One row per pillar, plus guardrails for what you will not cover.'],
        sections: [
          { h: 'Foundation', f: [
            ['Editorial mission this serves', 'Paste your mission statement; pillars must ladder up to it.', 2] ] },
          { h: 'The pillars (three to five)', t: { cols: [['Pillar name', 20], ['What it covers', 30], ['Audience need it serves', 28], ['Example topics', 22]], rows: 5 } },
          { h: 'Guardrails', f: [
            ['Topics we will not cover', 'Adjacent territory you are explicitly ceding.', 2],
            ['What we cut to commit', 'Existing content or plans that fall outside the pillars.', 2] ] }
        ] },
      swot: { title: 'Content SWOT', file: 'content-swot', formats: ['docx', 'pdf'],
        intro: 'Strengths, weaknesses, opportunities, and threats, scoped strictly to the content program.',
        notes: ['The classic four-quadrant grid, plus a section that turns it into moves.'],
        sections: [
          { h: 'The four quadrants', grid: [
            ['Strengths (internal)', 'What your content does well: assets, rankings, expertise, distribution.', 7],
            ['Weaknesses (internal)', 'Where you underperform: gaps, quality, cadence, resources.', 7],
            ['Opportunities (external)', 'Openings: competitor gaps, new channels, rising topics.', 7],
            ['Threats (external)', 'Risks: algorithm shifts, competitors, AI answers, budget.', 7] ] },
          { h: 'So what', f: [
            ['Top three moves this quarter', 'Each move should pair a strength with an opportunity, or shore up a weakness a threat exposes.', 3] ] }
        ] },
      persona: { title: 'Audience Persona', file: 'audience-persona', formats: ['docx', 'pdf'],
        intro: 'One persona per copy of this template. Ground every field in real research, not guesses.',
        notes: ['Identity, context, verbatim language, and what it all means for content.'],
        sections: [
          { h: 'Identity', f: [
            ['Name and role', 'A memorable name plus their job title.', 1],
            ['Snapshot', 'Two sentences that make this person feel real.', 2] ] },
          { h: 'Context', f: [
            ['Goals', 'What they are trying to accomplish in their role.', 2],
            ['Pain points', 'The frustrations and blockers your content can address.', 3],
            ['Environment and constraints', 'Team size, budget, tools, time pressure.', 2] ] },
          { h: 'Language and sources', f: [
            ['Questions they ask, verbatim', 'Pull from sales calls, support tickets, and forums.', 3],
            ['Words and phrases they use', 'Their vocabulary, not your internal jargon.', 2],
            ['Where they look for answers', 'Channels, communities, publications, people.', 2] ] },
          { h: 'Content implications', f: [
            ['Formats and channels that reach them', 'How this persona actually consumes content.', 2],
            ['Objections content must answer', 'What stands between them and acting.', 2] ] }
        ] },
      jtbd: { title: 'Jobs-to-be-Done Canvas', file: 'jtbd-canvas', formats: ['docx', 'pdf'],
        intro: 'Frame content around the job the reader is hiring it to complete. One job per copy.',
        notes: ['The job statement, the four forces, and the content that helps them make progress.'],
        sections: [
          { h: 'The job statement', f: [
            ['When I... (situation)', 'The triggering circumstance.', 1],
            ['I want to... (motivation)', 'What they are trying to do.', 1],
            ['So I can... (outcome)', 'The progress they are really after.', 1] ] },
          { h: 'The four forces', grid: [
            ['Push of the situation', 'What is wrong with how they do it today.', 5],
            ['Pull of the new solution', 'What attracts them to a better way.', 5],
            ['Anxieties', 'What makes them hesitate to switch.', 5],
            ['Habits', 'What keeps them doing it the old way.', 5] ] },
          { h: 'Content response', f: [
            ['Content that helps them make progress', 'Pieces that amplify push and pull, and defuse anxiety and habit.', 3] ] }
        ] },
      corestatement: { title: 'Core Strategy Statement + Messaging Framework', file: 'messaging-framework', formats: ['docx', 'pdf'],
        intro: 'The single document that tells every writer what to say, and in what order.',
        notes: ['Core promise, proof, and a three-message ladder.'],
        sections: [
          { h: 'The core', f: [
            ['Core promise', 'The one claim everything else supports.', 2],
            ['Who it is for', 'The audience the promise is made to.', 1],
            ['Why believe us', 'Proof points: evidence, results, credentials.', 3] ] },
          { h: 'Messaging ladder', f: [
            ['Supporting message 1, plus proof', 'A claim that makes the promise concrete.', 2],
            ['Supporting message 2, plus proof', '', 2],
            ['Supporting message 3, plus proof', '', 2] ] },
          { h: 'Usage', f: [
            ['Where each message shows up', 'Map messages to pages, campaigns, and channels.', 2] ] }
        ] },
      voicetone: { title: 'Brand Voice + Tone Guide', file: 'voice-tone-guide', formats: ['docx', 'pdf'],
        intro: 'Voice stays constant. Tone adapts to context. Define both so any writer can sound like you.',
        notes: ['Voice traits, a this-not-that table, and tone by situation.'],
        sections: [
          { h: 'Voice', f: [
            ['Three personality traits', 'Each with one sentence on what it means in practice.', 3],
            ['We sound like / we never sound like', 'Reference points that make the traits concrete.', 2] ] },
          { h: 'This, not that', t: { cols: [['We say', 34], ['We never say', 34], ['Why', 32]], rows: 6 } },
          { h: 'Tone by situation', t: { cols: [['Situation', 26], ['Tone shifts to', 30], ['Example line', 44]], rows: 5 } }
        ] },
      pov: { title: 'Point of View (POV)', file: 'pov', formats: ['docx', 'pdf'],
        intro: 'A structured, defensible recommendation you put in front of a client or stakeholder.',
        notes: ['Situation, tension, position, evidence, and the ask.'],
        sections: [
          { h: 'The argument', f: [
            ['Situation', 'The relevant facts, stated neutrally.', 2],
            ['Tension', 'What is at stake, and why now.', 2],
            ['Our point of view', 'The position you are taking, in one or two sentences.', 2],
            ['Evidence', 'Data, examples, and experience that back the position.', 3],
            ['The ask', 'The specific decision or action you recommend.', 2] ] },
          { h: 'Pressure test', f: [
            ['Strongest counterargument, and our answer', 'If you cannot answer it, the POV is not ready.', 2],
            ['Risks if we are wrong', 'What it costs, and how you would detect it early.', 2] ] }
        ] },
      workflow: { title: 'Content Workflow / Process Map', file: 'content-workflow', formats: ['docx', 'pdf'],
        intro: 'Every stage a piece passes through, who owns it, and what it takes to move forward.',
        notes: ['A stage table with entry and exit criteria, so nothing sits in review limbo.'],
        sections: [
          { h: 'The stages', t: { cols: [['Stage', 16], ['Owner (role)', 16], ['Entry criteria', 26], ['Exit criteria', 26], ['Target time', 16]], rows: 7 } },
          { h: 'Around the stages', f: [
            ['Parallel review tracks', 'Legal, brand, technical: who reviews what, and when.', 2],
            ['Where work is tracked', 'The single tool where a piece\u2019s stage is visible to all.', 1],
            ['What happens when a piece stalls', 'Who unblocks it, and after how long.', 2] ] }
        ] },
      styleguide: { title: 'Editorial Style Guide', file: 'editorial-style-guide', formats: ['docx', 'pdf'],
        intro: 'The house rulebook. One decided rule beats a hundred editor debates.',
        notes: ['Mechanics, formatting, and a word list. Start small and grow it from real edits.'],
        sections: [
          { h: 'Mechanics', f: [
            ['Base style manual', 'The published guide you defer to (AP, Chicago...), so this document only records exceptions.', 1],
            ['House spellings and terms', 'Product names, capitalizations, trademarks.', 3],
            ['Punctuation rules', 'Serial comma, dashes, quotation conventions.', 2],
            ['Numbers, dates, units', 'When to spell out, formats, time zones.', 2] ] },
          { h: 'Formatting', f: [
            ['Headings and capitalization', 'Sentence case or title case, heading depth.', 2],
            ['Links, citations, alt text', 'How to credit sources and describe images.', 2] ] },
          { h: 'Word list', t: { cols: [['Use', 30], ['Not', 30], ['Notes', 40]], rows: 8 } }
        ] },
      contributors: { title: 'Contributor / Freelancer Guidelines', file: 'contributor-guidelines', formats: ['docx', 'pdf'],
        intro: 'Everything an external writer needs to produce a usable first draft. Keep it short enough to actually read.',
        notes: ['Context, process, and standards on a few pages.'],
        sections: [
          { h: 'Context', f: [
            ['Who we are and who we serve', 'Two sentences of company context plus the audience.', 2],
            ['What good looks like', 'Link two or three published pieces that hit the mark, and say why.', 2] ] },
          { h: 'Process', f: [
            ['How assignments arrive', 'Where the brief lives and what it contains.', 1],
            ['Handoff and revision process', 'Where to submit, how feedback arrives, how many rounds.', 2],
            ['Payment and invoicing', 'Rates, terms, and who to invoice.', 1] ] },
          { h: 'Standards', f: [
            ['Voice in one line', 'Plus a link to the full voice and tone guide.', 1],
            ['Formatting requirements', 'File format, headings, images, links.', 2],
            ['Sourcing rules', 'What counts as a citable source; what is off-limits.', 2] ] }
        ] },
      repurposing: { title: 'Repurposing / Atomization Matrix', file: 'repurposing-matrix', formats: ['docx', 'pdf'],
        intro: 'Plan the full ecosystem of spinoffs from one pillar asset before you produce it.',
        notes: ['The core asset, its message, and a spinoff table with owners and dates.'],
        sections: [
          { h: 'The core asset', f: [
            ['Pillar asset (title and link)', 'The substantial piece everything derives from.', 1],
            ['Core message', 'The one idea every spinoff must carry.', 2] ] },
          { h: 'The spinoffs', t: { cols: [['Format', 16], ['Channel', 16], ['Angle or excerpt', 36], ['Owner', 14], ['Date', 18]], rows: 8 } },
          { h: 'Reality check', f: [
            ['Why repurpose this asset', 'Resourcefulness is a reason; filling a calendar is not.', 2] ] }
        ] },
      governance: { title: 'Content Governance Plan', file: 'content-governance', formats: ['docx', 'pdf'],
        intro: 'The long-term standards and ownership that keep content from decaying after launch.',
        notes: ['Ownership, decision rights, standards, and maintenance rules.'],
        sections: [
          { h: 'Ownership', f: [
            ['Who owns content strategy', 'One accountable person.', 1],
            ['Who owns each channel or section', 'Site sections, blog, docs, social.', 2],
            ['Decision rights', 'Who approves what: new sections, deletions, exceptions.', 2] ] },
          { h: 'Standards', f: [
            ['Policies every piece must meet', 'Accessibility, accuracy, legal, brand.', 3] ] },
          { h: 'Maintenance', f: [
            ['Review cadence by content type', 'Evergreen yearly, product content quarterly...', 2],
            ['Sunset rules', 'When content gets archived or deleted, and by whom.', 2] ] }
        ] },
      lifecycle: { title: 'Content Lifecycle + Refresh Plan', file: 'content-lifecycle', formats: ['docx', 'pdf'],
        intro: 'Create, publish, monitor, refresh, retire. Set the policy, then work the queue.',
        notes: ['Refresh triggers, sunset criteria, and a working refresh queue.'],
        sections: [
          { h: 'The policy', f: [
            ['Audit cadence', 'How often the catalog gets reviewed.', 1],
            ['Refresh triggers', 'Traffic decay thresholds, ranking drops, product changes, dated references.', 3],
            ['Sunset criteria', 'When a piece gets consolidated, archived, or deleted.', 2],
            ['Who executes', 'The role that owns refreshes, and their capacity.', 1] ] },
          { h: 'Refresh queue', t: { cols: [['URL', 30], ['Trigger hit', 22], ['Action', 16], ['Owner', 14], ['Due', 18]], rows: 8 } }
        ] },
      cardsort: { title: 'Card Sorting Study Plan', file: 'card-sort-plan', formats: ['docx', 'pdf'],
        intro: 'Plan the study before you recruit. One completed plan per card sort.',
        notes: ['Study design, logistics, and a synthesis section for after the sessions.'],
        sections: [
          { h: 'Study design', f: [
            ['Goal', 'The IA question this sort should answer.', 2],
            ['Method', 'Open, closed, or hybrid, and why.', 1],
            ['Participants', 'Who they are, how many, how recruited.', 2],
            ['The cards', 'How many, and what content they represent.', 2] ] },
          { h: 'Running it', f: [
            ['Tool and logistics', 'Moderated or unmoderated, in what tool.', 1],
            ['Instructions to participants', 'The exact prompt they will read.', 2] ] },
          { h: 'Synthesis (after)', f: [
            ['Patterns observed', 'Agreement scores, surprising groupings, labels users invented.', 3],
            ['IA changes to make', 'Concrete navigation and labeling decisions.', 3] ] }
        ] },
      audit: { title: 'Content Audit + Inventory', file: 'content-audit', formats: ['xlsx', 'pdf'],
        intro: 'One row per asset. Inventory first, then assess, then decide: keep, revise, consolidate, or kill.',
        notes: ['One row per asset with quality score and a Keep / Revise / Consolidate / Kill decision.', 'Excel is the working version; the PDF is a printable worksheet.'],
        pdfRows: 12,
        xlsx: { sheet: 'Inventory',
          cols: [['URL', 34], ['Title', 30], ['Type', 12], ['Owner', 14], ['Published', 12], ['Last updated', 12], ['Traffic /mo', 11], ['Quality 1-5', 11], ['Action', 14], ['Notes', 28]],
          example: ['/blog/example-post', 'Example post title  (delete this row)', 'Blog', 'J. Smith', '2024-03-02', '2025-11-10', 420, 3, 'Revise', 'Outdated screenshots'],
          blank: 20,
          howto: [
            'Export your URL list from the CMS or a crawler, one asset per row.',
            'Fill the assessment columns: quality (1-5 against your standards) and traffic.',
            'Choose an Action for every row: Keep, Revise, Consolidate, or Kill. No row stays undecided.',
            'Sort by Action and turn the Revise and Kill lists into scheduled work.'] } },
      gap: { title: 'Competitive Content Gap Analysis', file: 'content-gap-analysis', formats: ['xlsx', 'pdf'],
        intro: 'Map audience needs against what you and your competitors publish. The empty cells are your roadmap.',
        notes: ['Topics down the side, your coverage and two competitors across, opportunity score per row.'],
        pdfRows: 12,
        xlsx: { sheet: 'Gap analysis',
          cols: [['Topic / query', 26], ['Audience need', 26], ['You have it?', 14], ['Competitor A', 14], ['Competitor B', 14], ['Opportunity 1-5', 14], ['Action', 14]],
          example: ['pricing comparison  (delete this row)', 'Evaluators want cost clarity', 'No', 'Yes, ranks #3', 'Yes, ranks #5', 5, 'Create'],
          blank: 18,
          howto: [
            'List topics your audience needs, from keyword research, sales calls, and support tickets.',
            'For each topic, record whether you cover it (link the URL) and whether each competitor does.',
            'Score the opportunity 1-5: search demand, fit to your pillars, and how beatable the competition is.',
            'Sort by opportunity and feed the top rows into your backlog.'] } },
      journey: { title: 'Customer Journey Map', file: 'journey-map', formats: ['xlsx', 'pdf'],
        intro: 'One persona per map. For each stage: their question, their state of mind, and the content they need.',
        notes: ['Stages as rows: question, feeling, content need, format, and your owned asset or gap.'],
        pdfRows: 8,
        xlsx: { sheet: 'Journey map',
          cols: [['Stage', 14], ['Their question', 30], ['Feeling', 14], ['Content they need', 30], ['Format / channel', 18], ['Owned asset or gap', 24]],
          example: ['Awareness  (delete this row)', 'Why does onboarding take so long?', 'Curious, overwhelmed', 'Explainers that name the problem', 'Blog, social, video', '/blog/onboarding (video is a gap)'],
          blank: 8,
          howto: [
            'Name the persona at the top; one map per persona.',
            'Use your own stages: Awareness, Consideration, Decision, Retention is a starting point.',
            'Fill each stage from research: real questions, real emotional states.',
            'The last column exposes gaps; feed them into your backlog.'] } },
      voc: { title: 'Voice-of-Customer Mining Log', file: 'voc-mining-log', formats: ['xlsx', 'pdf'],
        intro: 'Collect exact customer language from reviews, calls, and tickets. Mirror it back in your copy.',
        notes: ['One verbatim quote per row, tagged by theme, emotion, and frequency.'],
        pdfRows: 12,
        xlsx: { sheet: 'Mining log',
          cols: [['Source', 16], ['Verbatim quote', 46], ['Theme', 16], ['Emotion', 12], ['Frequency', 10], ['Use in', 20]],
          example: ['G2 review  (delete this row)', '\u201cSetup took us 20 minutes, not the week we budgeted.\u201d', 'Ease of setup', 'Relief', 'x7', 'Homepage hero'],
          blank: 20,
          howto: [
            'Copy quotes exactly as written or said. Do not paraphrase; the wording is the asset.',
            'Tag each quote with a theme and the emotion behind it.',
            'Count repetitions: frequency separates a theme from an anecdote.',
            'Assign the strongest quotes to specific pages and assets in the Use in column.'] } },
      matrix: { title: 'Content Matrix / Content Map', file: 'content-matrix', formats: ['xlsx', 'pdf'],
        intro: 'Audience by stage by format by topic. Every planned piece gets a row; empty intersections are gaps.',
        notes: ['One row per audience-stage-topic intersection, mapped to an owned asset or a gap.'],
        pdfRows: 12,
        xlsx: { sheet: 'Content matrix',
          cols: [['Audience segment', 20], ['Funnel stage', 14], ['Topic', 26], ['Format', 14], ['Channel', 16], ['Owned asset or gap', 24]],
          example: ['New managers  (delete this row)', 'Awareness', 'Delegation basics', 'Blog post', 'Organic + newsletter', '/blog/delegation'],
          blank: 18,
          howto: [
            'List your audience segments and funnel stages first, then fill intersections.',
            'One row per planned or existing piece; link the asset if it exists.',
            'Look for stages or segments with no rows: those are the strategic gaps.',
            'Review quarterly against the editorial calendar.'] } },
      clusters: { title: 'Topic Cluster / Pillar Map', file: 'topic-cluster-map', formats: ['xlsx', 'pdf'],
        intro: 'One pillar page, many interlinked cluster articles. Track the links; they are the mechanism.',
        notes: ['Pillar and cluster pairs with target query, status, and internal-link check.'],
        pdfRows: 12,
        xlsx: { sheet: 'Cluster map',
          cols: [['Pillar page (topic + URL)', 30], ['Cluster article', 28], ['Target query', 22], ['Status', 12], ['Linked both ways?', 16]],
          example: ['Onboarding metrics, /guides/onboarding-metrics  (delete this row)', 'Time-to-value benchmarks', 'time to value benchmark', 'Published', 'Yes'],
          blank: 18,
          howto: [
            'One pillar per group of rows; repeat the pillar cell for each of its clusters.',
            'Each cluster targets one specific query the pillar covers only briefly.',
            'The last column is the point: pillar links to cluster, cluster links back.',
            'Do not mark a cluster Done until both links exist.'] } },
      keywords: { title: 'Keyword Map', file: 'keyword-map', formats: ['xlsx', 'pdf'],
        intro: 'One keyword intent, one canonical page. This sheet is how you stop pages competing with each other.',
        notes: ['One row per keyword, mapped to exactly one canonical page.'],
        pdfRows: 12,
        xlsx: { sheet: 'Keyword map',
          cols: [['Keyword', 26], ['Intent', 14], ['Volume /mo', 12], ['Canonical page (URL)', 34], ['Status', 12], ['Notes', 20]],
          example: ['onboarding checklist  (delete this row)', 'Informational', 1900, '/blog/onboarding-checklist', 'Published', 'Refresh quarterly'],
          blank: 20,
          howto: [
            'One row per target keyword; group close variants onto the same row.',
            'Every keyword maps to exactly one URL. If two rows share a URL with different intents, split the page or the targeting.',
            'Before briefing a new piece, check this map for an existing canonical page.',
            'Recheck rankings quarterly and update Status.'] } },
      model: { title: 'Content Model / Taxonomy', file: 'content-model', formats: ['xlsx', 'pdf'],
        intro: 'Define each content type once: its purpose, its fields, and how it relates to other types.',
        notes: ['One row per content type, with fields and relationships spelled out.'],
        pdfRows: 8,
        xlsx: { sheet: 'Content model',
          cols: [['Content type', 18], ['Purpose', 28], ['Fields (name: type)', 36], ['Relationships', 24]],
          example: ['Case study  (delete this row)', 'Prove outcomes for evaluators', 'Title: text; Customer: reference; Metrics: list; Quote: text', 'Belongs to Industry; links to Product page'],
          blank: 12,
          howto: [
            'One row per content type in your CMS or planned system.',
            'List fields as name: type pairs; keep types primitive (text, rich text, reference, list, media).',
            'Relationships describe how types reference each other; they power reuse.',
            'Review with whoever configures the CMS before anything gets built.'] } },
      backlog: { title: 'Idea Backlog + RICE Prioritization', file: 'idea-backlog-rice', formats: ['xlsx', 'pdf'],
        intro: 'Score every idea: Reach times Impact times Confidence, divided by Effort. The sheet computes the score.',
        notes: ['The RICE score column calculates itself in Excel.', 'Scales: Reach = people per quarter; Impact 0.25 to 3; Confidence as a decimal (0.8); Effort in person-weeks.'],
        pdfRows: 12,
        xlsx: { sheet: 'Backlog',
          cols: [['Idea', 34], ['Pillar', 14], ['Reach', 10], ['Impact', 10], ['Confidence', 12], ['Effort', 10], ['RICE score', 12], ['Notes', 22]],
          example: ['Guide to onboarding metrics  (delete this row)', 'Retention', 5000, 2, 0.8, 3, '', 'Theme from sales calls'],
          blank: 14,
          calc: [{ col: 'G', rows: [4, 18], expr: 'IF(OR(C{r}="",F{r}="",F{r}=0),"",ROUND(C{r}*D{r}*E{r}/F{r},1))' }],
          howto: [
            'One idea per row; tie each to a pillar so the backlog stays on-strategy.',
            'Reach: people affected per quarter. Impact: 0.25 minimal, 0.5 low, 1 medium, 2 high, 3 massive.',
            'Confidence as a decimal: 1.0 high, 0.8 medium, 0.5 a bet. Effort in person-weeks.',
            'The RICE score computes automatically. Sort by it, then let the calendar take from the top.'] } },
      channels: { title: 'Channel Strategy / Distribution Matrix', file: 'channel-strategy', formats: ['xlsx', 'pdf'],
        intro: 'Every channel you publish to, and the strategic role of each. If a channel has no role, stop feeding it.',
        notes: ['One row per channel: role, audience, cadence, owner, and the KPI that proves it.'],
        pdfRows: 10,
        xlsx: { sheet: 'Channels',
          cols: [['Channel', 16], ['Role (why we are here)', 30], ['Audience', 18], ['Cadence', 12], ['Owner', 14], ['Primary KPI', 16]],
          example: ['Newsletter  (delete this row)', 'Owned: direct relationship, launch amplification', 'Existing customers', 'Weekly', 'J. Smith', 'Open rate'],
          blank: 10,
          howto: [
            'One row per channel, including the ones you are quietly neglecting.',
            'The Role column is the test: state what this channel does that others do not.',
            'Every channel needs an owner and one primary KPI, not five.',
            'Review twice a year; retire channels whose role has evaporated.'] } },
      kpi: { title: 'KPI / Measurement Framework', file: 'kpi-framework', formats: ['xlsx', 'pdf'],
        intro: 'Connect what you track to the business outcomes that justify the work, level by level.',
        notes: ['One row per metric, tagged by level: activity, engagement, outcome, or business impact.'],
        pdfRows: 12,
        xlsx: { sheet: 'KPI framework',
          cols: [['Metric', 22], ['Level', 20], ['Target', 14], ['Source / tool', 16], ['Owner', 14], ['Reviewed', 12]],
          example: ['Organic sessions  (delete this row)', 'Engagement', '+20% by Q4', 'GA4', 'Content lead', 'Monthly'],
          blank: 12,
          howto: [
            'Tag every metric with its level: Activity (what you did), Engagement (what they did), Outcome (leads, signups), Business impact (revenue, retention).',
            'Every level should ladder to the one above it; a metric that ladders nowhere is vanity.',
            'Set a target and a review cadence for each row.',
            'Keep it short: a dozen metrics you act on beat fifty you report.'] } },
      scorecard: { title: 'Content Quality Scorecard', file: 'quality-scorecard', formats: ['xlsx', 'pdf'],
        intro: 'A weighted pre-publish rubric. Score each criterion 1-5; the sheet computes the weighted total.',
        notes: ['Seven starter criteria with weights; the weighted total calculates itself in Excel.'],
        pdfRows: 10,
        xlsx: { sheet: 'Scorecard',
          cols: [['Criterion', 22], ['What good looks like', 42], ['Weight', 10], ['Score 1-5', 10], ['Weighted', 10]],
          example: null,
          rowsData: [
            ['Accuracy', 'Claims sourced, data current, product details correct.', 0.2, '', ''],
            ['Clarity', 'A reader gets the point of every section on first pass.', 0.15, '', ''],
            ['Relevance to persona', 'Speaks to a named persona\u2019s real questions.', 0.2, '', ''],
            ['Completeness', 'Covers the topic well enough to be the last stop.', 0.15, '', ''],
            ['Brand and voice fit', 'Sounds like us per the voice and tone guide.', 0.1, '', ''],
            ['SEO basics', 'Target query, title, headings, internal links in place.', 0.1, '', ''],
            ['CTA strength', 'A clear, appropriate next step for the reader.', 0.1, '', '']],
          blank: 3,
          calc: [{ col: 'E', rows: [4, 13], expr: 'IF(OR(C{r}="",D{r}=""),"",C{r}*D{r})' }],
          extraBottom: [['Total', '', '', '', '']],
          cellFormulas: [['E14', 'SUM(E4:E13)']],
          howto: [
            'Score each criterion 1-5 before publishing; the weighted column computes itself.',
            'Weights must sum to 1.0; adjust them to your program, then leave them alone.',
            'Set a pass threshold (for example 3.5) and hold to it.',
            'Reviewers with editorial expertise should score, not the author.'] } },
      sitemap: { title: 'IA / Sitemap Worksheet', file: 'sitemap-worksheet', formats: ['xlsx', 'pdf'],
        intro: 'One row per page or section: level, label, URL, and parent. The outline is the architecture.',
        notes: ['A flat outline of the hierarchy that is easy to sort, filter, and hand to a designer.'],
        pdfRows: 14,
        xlsx: { sheet: 'Sitemap',
          cols: [['Level', 8], ['Label', 22], ['URL / slug', 28], ['Parent', 20], ['Content type', 16], ['Notes', 24]],
          example: [1, 'Resources  (delete this row)', '/resources', 'Home', 'Hub page', ''],
          blank: 24,
          howto: [
            'One row per page; Level 1 is top navigation, Level 2 sits beneath it, and so on.',
            'Labels are what users see; test them with card sorting before committing.',
            'Every row except Home needs a parent.',
            'Sort by parent to see each section; hunt for orphans and label collisions.'] } }
    };
  }

  tplSpecDocx(id) {
    const spec = this.tplSpecs()[id];
    const d = window.docx;
    if (!d) { alert('The Word generator is still loading. Please try again in a moment.'); return; }
    if (!spec) return;
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, ExternalHyperlink } = d;
    const FONT = 'Arial', HL = 'F7C531', INK = '16160E', GRAY = '6B6A5E', LINE = 'D8D6C9';
    const bd = { style: BorderStyle.SINGLE, size: 4, color: LINE };
    const borders = { top: bd, bottom: bd, left: bd, right: bd };
    const margins = { top: 110, bottom: 110, left: 140, right: 140 };
    const blanks = n => Array.from({ length: n }, () => new Paragraph({ children: [new TextRun({ text: '', size: 21, font: FONT })] }));
    const kids = [];
    kids.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: ' ' + spec.title + ' ', bold: true, size: 52, font: FONT, color: INK, shading: { type: ShadingType.CLEAR, fill: HL } })] }));
    kids.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: spec.intro, size: 22, font: FONT, color: GRAY })] }));
    (spec.sections || []).forEach(sec => {
      kids.push(new Paragraph({ spacing: { before: 260, after: 120 }, children: [new TextRun({ text: ' ' + sec.h + ' ', bold: true, size: 26, font: FONT, color: INK, shading: { type: ShadingType.CLEAR, fill: HL } })] }));
      if (sec.f) {
        const rows = sec.f.map(f => new TableRow({ children: [
          new TableCell({ width: { size: 34, type: WidthType.PERCENTAGE }, borders, margins, children: [
            new Paragraph({ children: [new TextRun({ text: f[0], bold: true, size: 21, font: FONT, color: INK })] }),
            new Paragraph({ children: [new TextRun({ text: f[1], size: 18, font: FONT, color: GRAY })] })
          ]}),
          new TableCell({ width: { size: 66, type: WidthType.PERCENTAGE }, borders, margins, children: blanks(f[2]) })
        ]}));
        kids.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
      } else if (sec.grid) {
        const cell = g => new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders, margins, children: g ? [
          new Paragraph({ children: [new TextRun({ text: g[0], bold: true, size: 21, font: FONT, color: INK })] }),
          new Paragraph({ children: [new TextRun({ text: g[1], size: 18, font: FONT, color: GRAY })] })
        ].concat(blanks(g[2] || 4)) : blanks(1) });
        const rows = [];
        for (let i = 0; i < sec.grid.length; i += 2) rows.push(new TableRow({ children: [cell(sec.grid[i]), cell(sec.grid[i + 1])] }));
        kids.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
      } else if (sec.t) {
        const total = sec.t.cols.reduce((a, c) => a + c[1], 0);
        const wPct = c => ({ size: Math.round(100 * c[1] / total), type: WidthType.PERCENTAGE });
        const rows = [new TableRow({ children: sec.t.cols.map(c => new TableCell({ width: wPct(c), borders, margins, shading: { type: ShadingType.CLEAR, fill: 'F0EFE4' }, children: [new Paragraph({ children: [new TextRun({ text: c[0], bold: true, size: 19, font: FONT, color: INK })] })] })) })];
        for (let r = 0; r < (sec.t.rows || 8); r++) rows.push(new TableRow({ children: sec.t.cols.map(c => new TableCell({ width: wPct(c), borders, margins, children: blanks(1) })) }));
        kids.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
      }
    });
    kids.push(this.docxBrandFooter(d));
    const doc = new Document({ sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1080, right: 1080 } } }, children: kids }] });
    Packer.toBlob(doc).then(b => this.dlBlob(b, spec.file + '-template.docx'));
  }

  async tplSpecPdf(id) {
    const spec = this.tplSpecs()[id];
    const PL = window.PDFLib;
    if (!PL) { alert('The PDF generator is still loading. Please try again in a moment.'); return; }
    if (!spec) return;
    const { PDFDocument, StandardFonts, rgb, PDFName, PDFString } = PL;
    const doc = await PDFDocument.create();
    const helv = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const form = doc.getForm();
    const INK = rgb(0.086, 0.086, 0.055), GRAY = rgb(0.42, 0.415, 0.37), HLC = rgb(0.969, 0.773, 0.192), LINE = rgb(0.78, 0.77, 0.72);
    const W = 612, H = 792, M = 54, CW = W - 2 * M;
    let page, y, fi = 0;
    const footer = pg => this.pdfBrandFooter(doc, pg, PL, helv, bold, M, GRAY);
    const newPage = () => { page = doc.addPage([W, H]); footer(page); y = H - 56; };
    newPage();
    const ensure = h => { if (y - h < 52) newPage(); };
    const wrap = (text, size, font, width) => {
      const words = String(text).split(' '); const lines = []; let cur = '';
      words.forEach(wd => { const t = cur ? cur + ' ' + wd : wd; if (font.widthOfTextAtSize(t, size) > width && cur) { lines.push(cur); cur = wd; } else cur = t; });
      if (cur) lines.push(cur);
      return lines;
    };
    const tw = bold.widthOfTextAtSize(spec.title, 24);
    page.drawRectangle({ x: M - 4, y: y - 7, width: Math.min(tw, CW) + 12, height: 32, color: HLC });
    page.drawText(spec.title, { x: M + 2, y: y, size: Math.min(24, 24 * CW / (tw + 1)), font: bold, color: INK });
    y -= 24;
    wrap(spec.intro, 9.5, helv, CW).forEach(ln => { page.drawText(ln, { x: M, y: y - 6, size: 9.5, font: helv, color: GRAY }); y -= 13; });
    y -= 18;
    const heading = text => {
      ensure(46);
      const w = bold.widthOfTextAtSize(text, 12);
      page.drawRectangle({ x: M - 3, y: y - 15, width: w + 10, height: 18, color: HLC });
      page.drawText(text, { x: M + 2, y: y - 11, size: 12, font: bold, color: INK });
      y -= 32;
    };
    const field = (label, hint, lines) => {
      const boxH = 12 + 14 * lines;
      ensure(14 + (hint ? 14 : 4) + boxH + 14);
      page.drawText(label, { x: M, y: y - 10, size: 10.5, font: bold, color: INK });
      y -= 14;
      if (hint) { page.drawText(hint, { x: M, y: y - 9, size: 8.5, font: helv, color: GRAY }); y -= 14; } else y -= 4;
      const tf = form.createTextField('tpl.' + id + '.f' + (fi++));
      if (lines > 1) tf.enableMultiline();
      tf.addToPage(page, { x: M, y: y - boxH, width: CW, height: boxH, borderColor: LINE, borderWidth: 1, backgroundColor: rgb(1, 1, 1) });
      tf.setFontSize(10);
      y -= boxH + 14;
    };
    const gridSec = cells => {
      const colW = (CW - 14) / 2;
      for (let i = 0; i < cells.length; i += 2) {
        const pair = [cells[i], cells[i + 1]].filter(Boolean);
        const hintLines = pair.map(g => wrap(g[1], 8, helv, colW));
        const hintH = 14 + (Math.max.apply(null, hintLines.map(h => h.length)) - 1) * 11;
        const boxH = 12 + 13 * Math.max.apply(null, pair.map(g => g[2] || 4));
        ensure(14 + hintH + boxH + 16);
        pair.forEach((g, j) => {
          const x = M + j * (colW + 14);
          page.drawText(g[0], { x, y: y - 10, size: 10.5, font: bold, color: INK });
          hintLines[j].forEach((ln, k) => page.drawText(ln, { x, y: y - 24 - k * 11, size: 8, font: helv, color: GRAY }));
          const tf = form.createTextField('tpl.' + id + '.f' + (fi++));
          tf.enableMultiline();
          tf.addToPage(page, { x, y: y - 14 - hintH - boxH, width: colW, height: boxH, borderColor: LINE, borderWidth: 1, backgroundColor: rgb(1, 1, 1) });
          tf.setFontSize(9);
        });
        y -= 14 + hintH + boxH + 16;
      }
    };
    const tableSec = (cols, rows) => {
      const total = cols.reduce((a, c) => a + c[1], 0);
      const xs = []; let acc = M;
      cols.forEach(c => { xs.push(acc); acc += CW * c[1] / total; });
      const header = () => {
        ensure(16 + 22);
        page.drawRectangle({ x: M, y: y - 16, width: CW, height: 16, color: rgb(0.941, 0.933, 0.878) });
        cols.forEach((c, i) => page.drawText(c[0], { x: xs[i] + 3, y: y - 12, size: 7.5, font: bold, color: INK }));
        y -= 18;
      };
      header();
      for (let r = 0; r < rows; r++) {
        if (y - 22 < 52) { newPage(); header(); }
        cols.forEach((c, i) => {
          const wCol = CW * c[1] / total - 4;
          const tf = form.createTextField('tpl.' + id + '.f' + (fi++));
          tf.addToPage(page, { x: xs[i] + 1, y: y - 18, width: wCol, height: 17, borderColor: LINE, borderWidth: 0.75, backgroundColor: rgb(1, 1, 1) });
          tf.setFontSize(8);
        });
        y -= 20;
      }
      y -= 10;
    };
    if (spec.sections) {
      spec.sections.forEach(sec => {
        heading(sec.h);
        if (sec.f) sec.f.forEach(f => field(f[0], f[1], f[2]));
        else if (sec.grid) gridSec(sec.grid);
        else if (sec.t) tableSec(sec.t.cols, sec.t.rows || 8);
      });
    } else if (spec.xlsx) {
      tableSec(spec.xlsx.cols, spec.pdfRows || 12);
      if (spec.xlsx.howto) {
        heading('How to use');
        spec.xlsx.howto.forEach((t, i) => {
          wrap((i + 1) + '. ' + t, 9, helv, CW).forEach(ln => { ensure(14); page.drawText(ln, { x: M, y: y - 9, size: 9, font: helv, color: GRAY }); y -= 12; });
          y -= 3;
        });
      }
    }
    form.updateFieldAppearances(helv);
    const bytes = await doc.save();
    this.dlBlob(new Blob([bytes], { type: 'application/pdf' }), spec.file + '-template.pdf');
  }

  tplSpecXlsx(id) {
    const spec = this.tplSpecs()[id];
    const X = window.XLSX;
    if (!X) { alert('The Excel generator is still loading. Please try again in a moment.'); return; }
    if (!spec || !spec.xlsx) return;
    const xs = spec.xlsx;
    const wb = X.utils.book_new();
    const aoa = [[spec.title], [], xs.cols.map(c => c[0])];
    if (xs.example) aoa.push(xs.example);
    if (xs.rowsData) xs.rowsData.forEach(r => aoa.push(r));
    for (let i = 0; i < (xs.blank || 15); i++) aoa.push(['']);
    if (xs.extraBottom) xs.extraBottom.forEach(r => aoa.push(r));
    const ws = X.utils.aoa_to_sheet(aoa);
    ws['!cols'] = xs.cols.map(c => ({ wch: c[1] }));
    (xs.calc || []).forEach(c => { for (let r = c.rows[0]; r <= c.rows[1]; r++) ws[c.col + r] = { t: 'n', f: c.expr.replace(/\{r\}/g, r) }; });
    (xs.cellFormulas || []).forEach(cf => { ws[cf[0]] = { t: 'n', f: cf[1] }; });
    X.utils.book_append_sheet(wb, ws, xs.sheet || 'Template');
    const how = X.utils.aoa_to_sheet([['How to use this template'], []].concat((xs.howto || []).map((t, i) => [(i + 1) + '. ' + t])).concat([[], [this.tplCredit()]]));
    how['!cols'] = [{ wch: 110 }];
    X.utils.book_append_sheet(wb, how, 'How to use');
    X.writeFile(wb, spec.file + '-template.xlsx');
  }

  async tplCalendarGridPdf() {
    const PL = window.PDFLib;
    if (!PL) { alert('The PDF generator is still loading. Please try again in a moment.'); return; }
    const { PDFDocument, StandardFonts, rgb, PDFName, PDFString } = PL;
    const doc = await PDFDocument.create();
    const helv = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const form = doc.getForm();
    const INK = rgb(0.086, 0.086, 0.055), GRAY = rgb(0.42, 0.415, 0.37), HLC = rgb(0.969, 0.773, 0.192), LINE = rgb(0.78, 0.77, 0.72);
    const W = 792, H = 612, M = 36;
    const page = doc.addPage([W, H]);
    const tw = bold.widthOfTextAtSize('Editorial Calendar', 20);
    page.drawRectangle({ x: M - 4, y: H - 47, width: tw + 12, height: 27, color: HLC });
    page.drawText('Editorial Calendar', { x: M + 2, y: H - 41, size: 20, font: bold, color: INK });
    page.drawText('Month:', { x: 586, y: H - 38, size: 10, font: bold, color: INK });
    const mf = form.createTextField('calgrid.period');
    mf.addToPage(page, { x: 626, y: H - 42, width: 130, height: 16, borderColor: LINE, borderWidth: 1, backgroundColor: rgb(1, 1, 1) });
    mf.setFontSize(10);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const gx = M, gw = W - 2 * M, cw = gw / 7;
    const gTop = H - 66, gBottom = 44;
    const rowTop = gTop - 15, ch = (rowTop - gBottom) / 5;
    days.forEach((d, i) => page.drawText(d, { x: gx + i * cw + 4, y: gTop - 10, size: 8.5, font: bold, color: GRAY }));
    for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
      const x = gx + c * cw, yTop = rowTop - r * ch, n = r * 7 + c;
      page.drawRectangle({ x, y: yTop - ch, width: cw, height: ch, borderColor: LINE, borderWidth: 1 });
      const df = form.createTextField('calgrid.d' + n);
      df.addToPage(page, { x: x + 3, y: yTop - 18, width: 20, height: 14, borderColor: rgb(0.88, 0.87, 0.83), borderWidth: 0.5, backgroundColor: rgb(1, 1, 1) });
      df.setFontSize(8);
      const cf = form.createTextField('calgrid.c' + n);
      cf.enableMultiline();
      cf.addToPage(page, { x: x + 3, y: yTop - ch + 3, width: cw - 6, height: ch - 24, borderColor: rgb(1, 1, 1), borderWidth: 0, backgroundColor: rgb(1, 1, 1) });
      cf.setFontSize(7);
    }
    this.pdfBrandFooter(doc, page, PL, helv, bold, M, GRAY);
    form.updateFieldAppearances(helv);
    const bytes = await doc.save();
    this.dlBlob(new Blob([bytes], { type: 'application/pdf' }), 'editorial-calendar-month-grid.pdf');
  }

  templateMeta() {
    return {
      brief: {
        notes: [
          'Covers goal, audience, angle, outline, SEO targets, and guardrails.',
          'The PDF has type-into form fields and prints on standard letter paper.'
        ],
        formats: ['docx', 'pdf']
      },
      raci: {
        notes: [
          'Tasks down the side, roles across the top, R/A/C/I key included.',
          'Every row needs exactly one Accountable, the rule is built into each version.',
          'The PDF has type-into form fields and prints on standard letter paper; Excel is the easiest to extend.'
        ],
        formats: ['xlsx', 'pptx', 'pdf']
      },
      calendar: {
        notes: [
          'Owner, status, and channel columns, plus an idea-backlog sheet in Excel.',
          'The list PDF is form-fillable; the month grid PDF is a generic one-month wall calendar.'
        ],
        formats: ['xlsx', 'csv', 'pdf', 'pdfgrid']
      }
    };
  }

  templateVals(id) {
    const meta = this.templateMeta()[id] || this.tplSpecs()[id];
    if (!meta) return { hasTemplate: false };
    const labels = { docx: 'Word (.docx)', pdf: 'PDF (fillable)', pptx: 'PowerPoint (.pptx)', xlsx: 'Excel (.xlsx)', csv: 'CSV', pdfgrid: 'PDF (month grid)' };
    return {
      hasTemplate: true,
      templateNotes: meta.notes.map(text => ({ text })),
      templateFormats: meta.formats.map(f => ({ label: labels[f], onClick: () => this.downloadTemplate(id, f) }))
    };
  }

  downloadTemplate(id, fmt) {
    const run = () => {
      if (id === 'brief' && fmt === 'docx') return this.tplBriefDocx();
      if (id === 'brief' && fmt === 'pdf') return this.tplBriefPdf();
      if (id === 'raci' && fmt === 'xlsx') return this.tplRaciXlsx();
      if (id === 'raci' && fmt === 'pptx') return this.tplRaciPptx();
      if (id === 'raci' && fmt === 'pdf') return this.tplRaciPdf();
      if (id === 'calendar' && fmt === 'xlsx') return this.tplCalendarXlsx();
      if (id === 'calendar' && fmt === 'csv') return this.tplCalendarCsv();
      if (id === 'calendar' && fmt === 'pdf') return this.tplCalendarPdf();
      if (id === 'calendar' && fmt === 'pdfgrid') return this.tplCalendarGridPdf();
      const spec = this.tplSpecs()[id];
      if (spec) {
        if (fmt === 'docx') return this.tplSpecDocx(id);
        if (fmt === 'pdf') return this.tplSpecPdf(id);
        if (fmt === 'xlsx') return this.tplSpecXlsx(id);
      }
    };
    try {
      const r = run();
      if (r && r.catch) r.catch(e => { console.error(e); alert('Something went wrong generating that file. Please try again.'); });
    } catch (e) { console.error(e); alert('That generator is still loading. Please try again in a moment.'); }
  }

  dlBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  tplBriefFields() {
    return [
      { section: 'The basics', fields: [
        ['Working title', 'Include the target topic or keyword; the writer can refine the final title.', 1],
        ['Content type & format', 'Blog post, case study, landing page, video script\u2026 plus target length.', 1],
        ['Writer', 'Who is producing the draft.', 1],
        ['Editor / approver', 'Who reviews it, and who signs off.', 1],
        ['Draft due / publish date', 'Both dates, with time zone if the team is distributed.', 1]
      ]},
      { section: 'Goal & audience', fields: [
        ['Objective', 'What this piece should achieve for the business, and how you will know.', 2],
        ['Target audience', 'Who exactly this is for: role, seniority, situation, pain points.', 2],
        ['Reader takeaway', 'The one thing the reader should think, feel, or do afterward.', 2],
        ['Call to action', 'The next step you want the reader to take.', 1]
      ]},
      { section: 'Angle & structure', fields: [
        ['Angle / point of view', 'The argument this piece makes that existing pieces on the topic do not.', 2],
        ['Suggested outline', 'H2s and H3s, or key sections in order.', 6],
        ['Questions to answer', 'The specific questions the reader arrives with.', 3]
      ]},
      { section: 'SEO (skip for non-search pieces)', fields: [
        ['Primary keyword', 'One target query per page.', 1],
        ['Secondary keywords', 'Related terms and subtopics to cover naturally.', 2],
        ['Search intent', 'Informational, comparison, transactional\u2026 and what that implies for the piece.', 1],
        ['Internal links to include', 'Pages on your site this piece should link to.', 2],
        ['Sources & references', 'Trusted research links, plus competitor pieces to beat.', 3]
      ]},
      { section: 'Voice & guardrails', fields: [
        ['Tone', 'Point to your voice & tone guide if one exists.', 1],
        ['Things to avoid', 'Claims, competitors, phrases, or topics that are off-limits.', 2]
      ]}
    ];
  }

  tplBriefDocx() {
    const d = window.docx;
    if (!d) { alert('The Word generator is still loading. Please try again in a moment.'); return; }
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, ExternalHyperlink } = d;
    const FONT = 'Arial', HL = 'F7C531', INK = '16160E', GRAY = '6B6A5E', LINE = 'D8D6C9';
    const bd = { style: BorderStyle.SINGLE, size: 4, color: LINE };
    const borders = { top: bd, bottom: bd, left: bd, right: bd };
    const margins = { top: 110, bottom: 110, left: 140, right: 140 };
    const kids = [];
    kids.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: ' Content Brief ', bold: true, size: 52, font: FONT, color: INK, shading: { type: ShadingType.CLEAR, fill: HL } })] }));
    kids.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: 'One brief per piece of content. A good brief takes 30 minutes to write and saves hours of revision.', size: 22, font: FONT, color: GRAY })] }));
    kids.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'How to use: fill every field before handing off. If a field does not apply, write \u201cn/a\u201d rather than leaving it silent. Delete this line before sharing.', italics: true, size: 19, font: FONT, color: GRAY })] }));
    this.tplBriefFields().forEach(sec => {
      kids.push(new Paragraph({ spacing: { before: 260, after: 120 }, children: [new TextRun({ text: ' ' + sec.section + ' ', bold: true, size: 26, font: FONT, color: INK, shading: { type: ShadingType.CLEAR, fill: HL } })] }));
      const rows = sec.fields.map(f => new TableRow({
        children: [
          new TableCell({ width: { size: 34, type: WidthType.PERCENTAGE }, borders, margins, children: [
            new Paragraph({ children: [new TextRun({ text: f[0], bold: true, size: 21, font: FONT, color: INK })] }),
            new Paragraph({ children: [new TextRun({ text: f[1], size: 18, font: FONT, color: GRAY })] })
          ]}),
          new TableCell({ width: { size: 66, type: WidthType.PERCENTAGE }, borders, margins, children: Array.from({ length: f[2] }, () => new Paragraph({ children: [new TextRun({ text: '', size: 21, font: FONT })] })) })
        ]
      }));
      kids.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
    });
    kids.push(this.docxBrandFooter(d));
    const doc = new Document({ sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1080, right: 1080 } } }, children: kids }] });
    Packer.toBlob(doc).then(b => this.dlBlob(b, 'content-brief-template.docx'));
  }

  async tplBriefPdf() {
    const PL = window.PDFLib;
    if (!PL) { alert('The PDF generator is still loading. Please try again in a moment.'); return; }
    const { PDFDocument, StandardFonts, rgb, PDFName, PDFString } = PL;
    const doc = await PDFDocument.create();
    const helv = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const form = doc.getForm();
    const INK = rgb(0.086, 0.086, 0.055), GRAY = rgb(0.42, 0.415, 0.37), HLC = rgb(0.969, 0.773, 0.192), LINE = rgb(0.78, 0.77, 0.72);
    const W = 612, H = 792, M = 54;
    let page, y, fi = 0;
    const footer = pg => this.pdfBrandFooter(doc, pg, PL, helv, bold, M, GRAY);
    const newPage = () => { page = doc.addPage([W, H]); footer(page); y = H - 56; };
    newPage();
    const ensure = h => { if (y - h < 52) newPage(); };
    const tw = bold.widthOfTextAtSize('Content Brief', 24);
    page.drawRectangle({ x: M - 4, y: y - 7, width: tw + 12, height: 32, color: HLC });
    page.drawText('Content Brief', { x: M + 2, y: y, size: 24, font: bold, color: INK });
    y -= 24;
    page.drawText('One brief per piece. Type directly into the boxes; if a field does not apply, write \u201cn/a\u201d.', { x: M, y: y - 6, size: 9.5, font: helv, color: GRAY });
    y -= 30;
    const heading = text => {
      ensure(46);
      const w = bold.widthOfTextAtSize(text, 12);
      page.drawRectangle({ x: M - 3, y: y - 15, width: w + 10, height: 18, color: HLC });
      page.drawText(text, { x: M + 2, y: y - 11, size: 12, font: bold, color: INK });
      y -= 32;
    };
    const field = (label, hint, lines) => {
      const boxH = 12 + 14 * lines;
      ensure(14 + 14 + boxH + 14);
      page.drawText(label, { x: M, y: y - 10, size: 10.5, font: bold, color: INK });
      y -= 14;
      page.drawText(hint, { x: M, y: y - 9, size: 8.5, font: helv, color: GRAY });
      y -= 14;
      const tf = form.createTextField('brief.f' + (fi++));
      if (lines > 1) tf.enableMultiline();
      tf.addToPage(page, { x: M, y: y - boxH, width: W - 2 * M, height: boxH, borderColor: LINE, borderWidth: 1, backgroundColor: rgb(1, 1, 1) });
      tf.setFontSize(10);
      y -= boxH + 14;
    };
    this.tplBriefFields().forEach(sec => {
      heading(sec.section);
      sec.fields.forEach(f => field(f[0], f[1], f[2]));
    });
    form.updateFieldAppearances(helv);
    const bytes = await doc.save();
    this.dlBlob(new Blob([bytes], { type: 'application/pdf' }), 'content-brief-template.pdf');
  }

  tplRaciKey() {
    return [
      ['R', 'Responsible', 'Does the work. At least one per task.'],
      ['A', 'Accountable', 'Owns the outcome. Exactly one per task, no exceptions.'],
      ['C', 'Consulted', 'Gives input before the work is done. Two-way communication.'],
      ['I', 'Informed', 'Told after the work is done. One-way communication.']
    ];
  }

  tplRaciXlsx() {
    const X = window.XLSX;
    if (!X) { alert('The Excel generator is still loading. Please try again in a moment.'); return; }
    const wb = X.utils.book_new();
    const aoa = [
      ['RACI Matrix'],
      ['Project:', '', '', 'Owner:', '', 'Date:', ''],
      [],
      ['Key'],
      ...this.tplRaciKey().map(k => [k[0], k[1] + ': ' + k[2]]),
      ['Rule', 'Every row needs exactly one A. If two people are accountable, nobody is.'],
      [],
      ['Task / deliverable', 'Role or name 1', 'Role or name 2', 'Role or name 3', 'Role or name 4', 'Role or name 5', 'Role or name 6'],
      ['Example: draft the launch blog post  (delete this row)', 'R', 'A', 'C', '', 'I', ''],
      ...Array.from({ length: 14 }, () => [''])
    ];
    const ws = X.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [{ wch: 46 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }];
    X.utils.book_append_sheet(wb, ws, 'RACI Matrix');
    const how = X.utils.aoa_to_sheet([
      ['How to use this template'],
      [],
      ['1. Replace the six role columns with real roles or names. Start with functional roles, then add names.'],
      ['2. List tasks or deliverables down the left, one per row, framed as deliverables where possible.'],
      ['3. At each intersection, type R, A, C, or I. Leave the cell empty for no involvement.'],
      ['4. Check every row for exactly one A, then review the chart with the people named in it.'],
      ['5. Share it, and update it whenever roles or tasks change.'],
      [],
      [this.tplCredit()]
    ]);
    how['!cols'] = [{ wch: 110 }];
    X.utils.book_append_sheet(wb, how, 'How to use');
    X.writeFile(wb, 'raci-matrix-template.xlsx');
  }

  tplRaciPptx() {
    const Pptx = window.PptxGenJS;
    if (!Pptx) { alert('The PowerPoint generator is still loading. Please try again in a moment.'); return; }
    const INK = '16160E', GRAY = '52524A', HL = 'F7C531', PAPER = 'FDFCF7', LINE = 'C9C7BA', FACE = 'Arial';
    const p = new Pptx();
    p.defineLayout({ name: 'CSLT', width: 13.333, height: 7.5 });
    p.layout = 'CSLT';
    const credit = s => { s.addShape(p.ShapeType.rect, { x: 0.6, y: 7.06, w: 0.13, h: 0.13, fill: { color: HL } }); s.addText([{ text: this.tplMark(), options: { bold: true } }, { text: '      ' }, { text: this.tplUrl(), options: { hyperlink: { url: this.tplUrl() }, color: GRAY } }], { x: 0.8, y: 6.98, w: 12, h: 0.3, fontSize: 9, color: GRAY, fontFace: FACE }); };
    let s = p.addSlide();
    s.background = { color: PAPER };
    s.addText([{ text: 'RACI Matrix', options: { highlight: HL } }], { x: 0.6, y: 0.45, w: 8, h: 0.9, fontSize: 40, bold: true, color: INK, fontFace: FACE });
    s.addText('Who does the work, who owns the outcome, who weighs in, who gets told.', { x: 0.6, y: 1.35, w: 11, h: 0.4, fontSize: 16, color: GRAY, fontFace: FACE });
    this.tplRaciKey().forEach((k, i) => {
      const yy = 2.15 + i * 0.85;
      s.addText(k[0], { x: 0.6, y: yy, w: 0.55, h: 0.55, align: 'center', valign: 'middle', fontSize: 22, bold: true, color: INK, fontFace: FACE, fill: { color: HL } });
      s.addText([{ text: k[1] + '  ', options: { bold: true } }, { text: k[2], options: { color: GRAY } }], { x: 1.35, y: yy, w: 10.5, h: 0.55, valign: 'middle', fontSize: 15, color: INK, fontFace: FACE });
    });
    s.addText('How to use: fill in roles across the top of the matrix on the next slide, tasks down the side, then type R, A, C, or I in each cell. Every row needs exactly one A.', { x: 0.6, y: 5.9, w: 12, h: 0.8, fontSize: 13, italic: true, color: GRAY, fontFace: FACE });
    credit(s);
    s = p.addSlide();
    s.background = { color: PAPER };
    s.addText([{ text: 'RACI Matrix', options: { highlight: HL } }], { x: 0.6, y: 0.25, w: 5, h: 0.5, fontSize: 20, bold: true, color: INK, fontFace: FACE });
    s.addText('Project:  __________________        Owner:  __________________        Date:  ____________', { x: 6.0, y: 0.32, w: 7, h: 0.4, fontSize: 11, color: GRAY, fontFace: FACE });
    const head = [{ text: 'Task / deliverable', options: { bold: true, fill: { color: HL }, color: INK } }];
    for (let i = 1; i <= 6; i++) head.push({ text: 'Role ' + i, options: { bold: true, align: 'center', fill: { color: HL }, color: INK } });
    const rows = [head];
    rows.push([{ text: 'Type a task here, one deliverable per row\u2026', options: { color: GRAY, italic: true } }, '', '', '', '', '', '']);
    for (let i = 0; i < 8; i++) rows.push(['', '', '', '', '', '', '']);
    s.addTable(rows, { x: 0.6, y: 0.95, w: 12.13, rowH: 0.56, border: { pt: 0.75, color: LINE }, fontSize: 12, fontFace: FACE, color: INK, valign: 'middle', align: 'center', colW: [4.33, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3], fill: { color: 'FFFFFF' } });
    s.addText('Every row needs exactly one A.', { x: 0.6, y: 6.6, w: 6, h: 0.35, fontSize: 11, bold: true, color: INK, fontFace: FACE, highlight: HL });
    credit(s);
    p.writeFile({ fileName: 'raci-matrix-template.pptx' });
  }

  async tplRaciPdf() {
    const PL = window.PDFLib;
    if (!PL) { alert('The PDF generator is still loading. Please try again in a moment.'); return; }
    const { PDFDocument, StandardFonts, rgb, TextAlignment, PDFName, PDFString } = PL;
    const doc = await PDFDocument.create();
    const helv = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const form = doc.getForm();
    const INK = rgb(0.086, 0.086, 0.055), GRAY = rgb(0.42, 0.415, 0.37), HLC = rgb(0.969, 0.773, 0.192), LINE = rgb(0.78, 0.77, 0.72);
    const W = 612, H = 792, M = 40;
    const page = doc.addPage([W, H]);
    this.pdfBrandFooter(doc, page, PL, helv, bold, M, GRAY);
    let y = H - 52;
    const tw = bold.widthOfTextAtSize('RACI Matrix', 20);
    page.drawRectangle({ x: M - 4, y: y - 6, width: tw + 12, height: 27, color: HLC });
    page.drawText('RACI Matrix', { x: M + 2, y: y, size: 20, font: bold, color: INK });
    y -= 32;
    const meta = [['Project', 200], ['Owner', 175], ['Date', 115]];
    let mx = M;
    meta.forEach(mm => {
      page.drawText(mm[0] + ':', { x: mx, y: y - 1, size: 10, font: bold, color: INK });
      const f = form.createTextField('raci.' + mm[0].toLowerCase());
      f.addToPage(page, { x: mx + 44, y: y - 6, width: mm[1] - 44, height: 18, borderColor: LINE, borderWidth: 1, backgroundColor: rgb(1, 1, 1) });
      f.setFontSize(10);
      mx += mm[1] + 16;
    });
    y -= 28;
    const keyLine = this.tplRaciKey().map(k => k[0] + ' = ' + k[1]).join('    ') + '.    Every row needs exactly one A.';
    page.drawText(keyLine, { x: M, y: y - 4, size: 8.5, font: helv, color: GRAY });
    y -= 22;
    const col0 = 178, roleW = (W - 2 * M - col0) / 6, rowH = 30, headH = 24;
    page.drawRectangle({ x: M, y: y - headH, width: W - 2 * M, height: headH, color: HLC });
    page.drawText('Task / deliverable', { x: M + 6, y: y - 16, size: 9.5, font: bold, color: INK });
    for (let c = 0; c < 6; c++) {
      const rf = form.createTextField('raci.role' + c);
      rf.setAlignment(TextAlignment.Center);
      rf.addToPage(page, { x: M + col0 + c * roleW + 3, y: y - headH + 3, width: roleW - 6, height: headH - 6, borderColor: LINE, borderWidth: 1, backgroundColor: rgb(1, 1, 1) });
      rf.setFontSize(8);
    }
    page.drawText('Role or name \u00bb', { x: M + col0 - 78, y: y + 4, size: 7.5, font: helv, color: GRAY });
    y -= headH;
    const nRows = 18;
    for (let r = 0; r < nRows; r++) {
      const ty = y - (r + 1) * rowH;
      const tf = form.createTextField('raci.task' + r);
      tf.addToPage(page, { x: M, y: ty, width: col0, height: rowH, borderColor: LINE, borderWidth: 1, backgroundColor: rgb(1, 1, 1) });
      tf.setFontSize(9);
      for (let c = 0; c < 6; c++) {
        const cf = form.createTextField('raci.c' + r + '_' + c);
        cf.setMaxLength(3);
        cf.setAlignment(TextAlignment.Center);
        cf.addToPage(page, { x: M + col0 + c * roleW, y: ty, width: roleW, height: rowH, borderColor: LINE, borderWidth: 1, backgroundColor: rgb(1, 1, 1) });
        cf.setFontSize(11);
      }
    }
    form.updateFieldAppearances(helv);
    const bytes = await doc.save();
    this.dlBlob(new Blob([bytes], { type: 'application/pdf' }), 'raci-matrix-template.pdf');
  }

  tplCalendarCols() {
    return ['Publish date', 'Due date (draft)', 'Working title', 'Content type', 'Pillar / theme', 'Channel(s)', 'Author', 'Editor', 'Status', 'Primary keyword', 'Call to action', 'Link to brief', 'Notes'];
  }

  tplCalendarExample() {
    return ['2026-07-15', '2026-07-08', 'Example: How to plan a quarter of content  (delete this row)', 'Blog post', 'Planning', 'Blog + newsletter', 'A. Writer', 'E. Ditor', 'In draft', 'content planning', 'Subscribe', '', ''];
  }

  tplCalendarXlsx() {
    const X = window.XLSX;
    if (!X) { alert('The Excel generator is still loading. Please try again in a moment.'); return; }
    const wb = X.utils.book_new();
    const cal = X.utils.aoa_to_sheet([
      this.tplCalendarCols(),
      this.tplCalendarExample(),
      ...Array.from({ length: 30 }, () => [''])
    ]);
    cal['!cols'] = [{ wch: 12 }, { wch: 14 }, { wch: 46 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 28 }];
    X.utils.book_append_sheet(wb, cal, 'Calendar');
    const ideas = X.utils.aoa_to_sheet([
      ['Idea / working title', 'Proposed by', 'Pillar / theme', 'Audience', 'Priority (H, M, L)', 'Notes'],
      ...Array.from({ length: 20 }, () => [''])
    ]);
    ideas['!cols'] = [{ wch: 46 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 32 }];
    X.utils.book_append_sheet(wb, ideas, 'Idea backlog');
    const how = X.utils.aoa_to_sheet([
      ['How to use this template'],
      [],
      ['1. One row per piece of content. Keep detail light; link to the content brief instead of recreating it here.'],
      ['2. Every row needs an owner and a date. A calendar without accountable humans is a wish list.'],
      ['3. Suggested Status values: Idea / Briefed / In draft / In review / Scheduled / Published.'],
      ['4. Park unscheduled ideas in the Idea backlog sheet, and pull them onto the calendar when they earn a date.'],
      ['5. Fill it honestly. A realistic calendar is more useful than an aspirational one.'],
      [],
      [this.tplCredit()]
    ]);
    how['!cols'] = [{ wch: 110 }];
    X.utils.book_append_sheet(wb, how, 'How to use');
    X.writeFile(wb, 'editorial-calendar-template.xlsx');
  }

  tplCalendarCsv() {
    const esc = v => '"' + String(v).replace(/"/g, '""') + '"';
    const lines = [this.tplCalendarCols().map(esc).join(','), this.tplCalendarExample().map(esc).join(',')];
    for (let i = 0; i < 30; i++) lines.push('');
    this.dlBlob(new Blob([lines.join('\n')], { type: 'text/csv' }), 'editorial-calendar-template.csv');
  }

  async tplCalendarPdf() {
    const PL = window.PDFLib;
    if (!PL) { alert('The PDF generator is still loading. Please try again in a moment.'); return; }
    const { PDFDocument, StandardFonts, rgb, PDFName, PDFString } = PL;
    const doc = await PDFDocument.create();
    const helv = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const form = doc.getForm();
    const INK = rgb(0.086, 0.086, 0.055), GRAY = rgb(0.42, 0.415, 0.37), HLC = rgb(0.969, 0.773, 0.192), LINE = rgb(0.78, 0.77, 0.72);
    const W = 612, H = 792, M = 40;
    const page = doc.addPage([W, H]);
    this.pdfBrandFooter(doc, page, PL, helv, bold, M, GRAY);
    let y = H - 52;
    const tw = bold.widthOfTextAtSize('Editorial Calendar', 20);
    page.drawRectangle({ x: M - 4, y: y - 6, width: tw + 12, height: 27, color: HLC });
    page.drawText('Editorial Calendar', { x: M + 2, y: y, size: 20, font: bold, color: INK });
    page.drawText('Month / period:', { x: 350, y: y + 2, size: 10, font: bold, color: INK });
    const mf = form.createTextField('cal.period');
    mf.addToPage(page, { x: 432, y: y - 3, width: 140, height: 18, borderColor: LINE, borderWidth: 1, backgroundColor: rgb(1, 1, 1) });
    mf.setFontSize(10);
    y -= 26;
    page.drawText('One row per piece. Every row needs an owner and a date.', { x: M, y: y - 4, size: 9, font: helv, color: GRAY });
    y -= 14;
    page.drawText('Status: Idea / Briefed / In draft / In review / Scheduled / Published.', { x: M, y: y - 4, size: 9, font: helv, color: GRAY });
    y -= 18;
    const cols = [['Publish date', 62], ['Working title', 148], ['Type', 54], ['Channel(s)', 66], ['Owner', 60], ['Status', 54], ['Notes', 88]];
    const headH = 22, rowH = 34, nRows = 16;
    page.drawRectangle({ x: M, y: y - headH, width: W - 2 * M, height: headH, color: HLC });
    let cx = M;
    cols.forEach(c => { page.drawText(c[0], { x: cx + 5, y: y - 15, size: 9, font: bold, color: INK }); cx += c[1]; });
    y -= headH;
    for (let r = 0; r < nRows; r++) {
      const ty = y - (r + 1) * rowH;
      cx = M;
      cols.forEach((c, ci) => {
        const f = form.createTextField('cal.r' + r + '_' + ci);
        f.enableMultiline();
        f.addToPage(page, { x: cx, y: ty, width: c[1], height: rowH, borderColor: LINE, borderWidth: 1, backgroundColor: rgb(1, 1, 1) });
        f.setFontSize(8);
        cx += c[1];
      });
    }
    form.updateFieldAppearances(helv);
    const bytes = await doc.save();
    this.dlBlob(new Blob([bytes], { type: 'application/pdf' }), 'editorial-calendar-template.pdf');
  }
  }

  window.CSLTemplates = new CSLTemplates();
})();
