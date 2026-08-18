// coda-terms.js — CODA-focused term content for the AI Terminology webinar app.
// Loaded by index.html after terms.js; only activates when ?mode=coda is present.
// All 6 terms are mapped to the same schema as terms.js so app.js needs no structural changes.

(function () {
  if (new URLSearchParams(location.search).get('mode') !== 'coda') return;

  window.WEBINAR_TERMS = {

    hitl: {
      name: 'Human in the Loop',
      short: 'The person operating CODA may not be able to overrule it. The person who can was never present at the death.',
      intro: {
        icon: '👤',
        concept: 'A system in which a human provides oversight, validation, or correction of an AI system\'s outputs at defined points, retaining decision authority.',
        ambiguity: 'CODA\'s central claim is that a human always signs off. But in the community use case, the person operating CODA is a surveillance agent — not a clinician — and the clinician who signs off was never present at the death.',
        question: 'Is any human presence enough to call it "human in the loop", or does the human need the expertise, and the context, to meaningfully overrule the AI?'
      },
      conceptPrimer: {
        heading: 'Before you vote — quick concepts',
        items: [
          { term: 'Verbal autopsy', plain: 'Where no clinician saw the death, a structured interview with a relative is used to work out the probable cause. The standard method for deaths at home.' },
          { term: 'Community surveillance agent', plain: 'A trained non-clinician who visits households. In CODA\'s community setting, this is who runs the interview.' },
          { term: 'Sign-off / certification', plain: 'Putting a named, qualified person\'s authority behind the recorded cause of death.' }
        ]
      },
      formatA: {
        prompt: 'How do you think about Human in the Loop when it comes to a tool like CODA? Pick the definition closest to yours.',
        options: [
          { text: 'A requirement that a human is involved and accountable for an AI-driven decision — even where the specialist who would ordinarily make the call is absent.', source: 'Public health implementer' },
          { text: 'A clinical review step: a clinician accepts, modifies, or rejects each AI recommendation before it affects care or the record.', source: 'Clinical' },
          { text: 'A workflow design where AI handles routine cases and escalates uncertain or high-risk ones to a human reviewer, making best use of limited expert time.', source: 'Developer / implementer' },
          { text: 'A system design in which a person retains decision authority by overseeing, validating, or correcting AI outputs at defined points.', source: 'Regulatory' }
        ]
      },
      formatB: {
        scenario: 'In CODA\'s community use case, a community surveillance agent — not a clinician — conducts a verbal-autopsy interview with a bereaved relative six months after a death. CODA transcribes the conversation, assigns an underlying cause of death, and produces an ICD-coded preliminary certificate with a chain-of-thought explanation. The surveillance agent has no clinical training to judge whether the cause is right. In the current design, a clinician reviews and signs off downstream, working only from CODA\'s transcript and output. They never met the family and never saw the deceased.',
        prompt: 'Is this "Human in the Loop"?',
        options: [
          { text: 'Yes. A qualified clinician reviews and signs off before the cause is certified.' },
          { text: 'No. The reviewing clinician only sees CODA\'s transcript and output, with no independent way to verify the interview or examine the deceased. Sign-off risks becoming a rubber stamp.' },
          { text: 'It depends on what the sign-off is being used to certify: a public-health statistic, or a legal cause of death on an individual\'s record.' }
        ],
        discussion: [
          'The nurse-and-X-ray problem exists in CODA: the person operating the tool often can\'t overrule it, and the person who can never met the deceased.',
          'The term is doing two jobs at once — catching errors and carrying accountability — and those need different things to be true.',
          'Sign-off is a real guardrail only if the reviewer has something to check against. For CODA that is a live design question, not a slogan.'
        ]
      },
      formatC: {
        prompt: 'In CODA, is "Human in the Loop" primarily:',
        options: [
          { text: 'A safety mechanism (to catch wrong causes before they enter the record)' },
          { text: 'An accountability mechanism (so a named person is answerable for the certified cause)' }
        ],
        punchline: 'CODA asks the human to do both at once: catch errors and own the result. Those are different jobs needing different competencies, which is why "who signs off" is contested.'
      },
      interaction: {
        openFloor: { type: 'word cloud', prompt: 'In one word: what does the clinician\'s sign-off actually guarantee here?' },
        toChat: 'Where else in your work does a "human in the loop" sit at a point where they can\'t really check the machine? Drop an example in chat.',
        toCodaTeam: 'CODA team: in the community use case as it stands today, where does the clinician sign-off actually happen, and on what information?',
        facilitatorLanding: [
          'The term is doing two jobs at once — catching errors and carrying accountability — and those need different things to be true.',
          'The nurse-and-X-ray problem exists in CODA: the person operating the tool often can\'t overrule it, and the person who can never met the deceased.',
          'Sign-off is a real guardrail only if the reviewer has something to check against. For CODA that is a live design question, not a slogan.'
        ],
        optionalReVote: 'Re-run the lightning vote — safety or accountability. Did anyone move?'
      }
    },

    val: {
      name: 'Validation',
      short: 'CODA is validated on CHAMPS under-five deaths. Does that hold when a ministry asks to use it for routine adult mortality?',
      intro: {
        icon: '✅',
        concept: 'The process of testing an AI model to confirm it performs as intended, typically by evaluating it on data it has not previously seen.',
        ambiguity: 'CODA is trained and evaluated on CHAMPS data: under-five deaths, from specific surveillance sites, against expert panels. It is meant to be used far beyond that. Validated on under-five surveillance deaths — validated for whom?',
        question: 'If a tool was validated somewhere else, on someone else, how do you know it works here?'
      },
      conceptPrimer: {
        heading: 'Before you vote — quick concepts',
        items: [
          { term: 'CHAMPS', plain: 'A network that investigates under-five deaths using post-mortem sampling and expert review. CODA\'s training data comes from here.' },
          { term: 'Gold standard / DeCoDe panel', plain: 'The most rigorous available cause of death, set by an expert panel using all evidence including post-mortem tests. CODA is scored against it.' },
          { term: 'Under-five focus', plain: 'Current evidence is for deaths of children under five. Adults are not yet in scope.' }
        ]
      },
      formatA: {
        prompt: 'Four takes on Validation for health AI — which matches how you think about it in practice?',
        options: [
          { text: 'An ongoing process, not a one-time event: continuous assessment of whether a deployed model still performs as populations, data systems, and care delivery change over time.', source: 'Post-market surveillance' },
          { text: 'Testing a trained model on data from a different institution, population, or time period to assess whether its performance holds beyond the original context.', source: 'Regulatory / technical' },
          { text: 'Assessing whether a model validated elsewhere actually performs in your specific local context — your populations, facilities, and data infrastructure.', source: 'Public health implementer' },
          { text: 'A one-time pre-deployment check: evidence that a model performs adequately on an independent test set before it is approved for use.', source: 'Procurement / approval' }
        ]
      },
      formatB: {
        scenario: 'CODA\'s algorithm is trained and initially evaluated on CHAMPS data: deaths of children under five, ascertained against DeCoDe expert panels using post-mortem tissue sampling. Its go/no-go evaluation shows CODA improving on existing verbal-autopsy tools for the under-five underlying cause of death. A ministry partner asks whether CODA can be used for routine adult mortality in its district facilities.',
        prompt: 'Is CODA "validated" for that use?',
        options: [
          { text: 'Yes. CODA met its evaluation benchmark against a rigorous gold standard. Validation was done.' },
          { text: 'No. It was validated on under-five deaths against a surveillance-grade reference standard. Adult deaths, different causes, and routine non-surveillance settings each need their own validation.' },
          { text: 'The word is carrying two meanings — "passed its evaluation" and "fit for this deployment" — and both parties are right within their own frame.' }
        ],
        discussion: [
          '"Validated" is carrying two meanings: passed its evaluation, and fit for this deployment. Both can be true and still leave a gap.',
          'The gold standard barely exists outside CHAMPS sites, which is exactly where CODA is most needed, so "just validate locally" is not free.',
          'Where we place the burden of local validation is a Southern-led governance question as much as a technical one.'
        ]
      },
      formatC: {
        prompt: 'When CODA is described as "validated", responsibility for confirming it holds in a new country or population sits with:',
        options: [
          { text: 'The consortium / algorithm developers, to show the validation transfers' },
          { text: 'The deploying Centre of Excellence or ministry, to run local validation first' }
        ],
        punchline: 'Where you locate that responsibility is a governance choice, not a technical one, and it shapes whether "Southern-led" means owning the validation or inheriting someone else\'s.'
      },
      interaction: {
        openFloor: { type: 'open response', prompt: 'Finish the sentence: "Validated elsewhere isn\'t validated here because ______."' },
        toChat: 'Have you inherited a tool that was "validated" somewhere else and didn\'t hold locally? What broke? Chat it.',
        toCodaTeam: 'CODA team: what would a realistic first local validation look like at a site with no post-mortem sampling and no expert panel?',
        facilitatorLanding: [
          '"Validated" is carrying two meanings — passed its evaluation and fit for this deployment. Both can be true and still leave a gap.',
          'The gold standard barely exists outside CHAMPS sites, which is exactly where CODA is most needed, so "just validate locally" is not free.',
          'Where we place the burden of local validation is a Southern-led governance question as much as a technical one.'
        ],
        optionalReVote: 'Lightning re-vote: developers show it transfers, or deployers validate locally.'
      }
    },

    gov: {
      name: 'AI Governance',
      short: 'CODA\'s algorithm is trained on pooled data from multiple countries. Who owns the trained model, and who decides its future use?',
      intro: {
        icon: '🏛️',
        concept: 'The frameworks, processes, regulations, and accountability structures that guide how AI systems are built, deployed, monitored, and controlled.',
        ambiguity: 'CODA trains on pooled CHAMPS data from sites across several countries. The trained model will have value beyond the project. CODA\'s stated aim is a progressive transition to Southern-led governance through its Centres of Excellence.',
        question: 'Can you meaningfully govern an AI tool without governing the data and infrastructure it is built on and runs on?'
      },
      conceptPrimer: {
        heading: 'Before you vote — quick concepts',
        items: [
          { term: 'CRVS', plain: 'The government system that registers deaths and produces vital statistics. Cause of death is part of it.' },
          { term: 'Data sovereignty', plain: 'A country\'s claim to control over data generated about its people, and over what gets built from it.' },
          { term: 'The model as an asset', plain: 'Once trained, the model itself has value and can be reused or licensed — separately from the raw data.' }
        ]
      },
      formatA: {
        prompt: 'Four ways to frame AI Governance — which best captures what you mean when you raise it in practice?',
        options: [
          { text: 'Internal processes for documenting AI decisions, managing risk, and maintaining accountability for system behaviour within an organisation.', source: 'AI/ML governance' },
          { text: 'Laws, regulations, and oversight bodies that authorise, constrain, and audit health AI — including data protection, model approval, and post-market surveillance.', source: 'Regulatory' },
          { text: 'Policies, ethics principles, transparency requirements, and consent mechanisms ensuring AI in health respects rights, prevents harm, and remains publicly accountable.', source: 'Ethics / human rights' },
          { text: 'Government ownership and stewardship of the digital infrastructure — identifiers, registries, data pipelines, procurement terms — that determines who can build AI on it and who benefits.', source: 'Data sovereignty' }
        ]
      },
      formatB: {
        scenario: 'CODA\'s cause-of-death algorithm is trained on pooled CHAMPS mortality data from surveillance sites across several countries. As CODA matures, the trained model has clear value: it could be offered to national CRVS systems or licensed onward. The consortium is currently led from global-North institutions, with Centres of Excellence at Wits VIDA and icddr,b positioned to take on progressive leadership. Data-use agreements permit using the data to develop CODA, but do not clearly address who owns the resulting model or who decides its future use.',
        prompt: 'Is this an AI governance gap?',
        options: [
          { text: 'Yes. The agreements should have defined ownership and future-use rights of the trained model, not just permission to use the data.' },
          { text: 'Yes, but upstream. The deeper gap is the absence of a framework treating pooled national mortality data — and models built on it — as a sovereign asset.' },
          { text: 'No. The consortium\'s Southern-led-governance intent and the Centre-of-Excellence structure are the safeguard. This is a design in progress, not a failure.' }
        ],
        discussion: [
          'CODA already has a Governing Board, a Scientific Advisory Committee, and Technical Working Groups. That is project governance; AI governance also has to reach the data and the model.',
          'You can\'t govern what you don\'t control. If the model and hosting sit outside the country, governing the outputs alone doesn\'t bite.',
          'The COE ownership model is genuinely unresolved. Naming it here is the point, not smoothing it over.'
        ]
      },
      formatC: {
        prompt: 'When we say "AI governance" for CODA, the primary subject should be:',
        options: [
          { text: 'The model and its outputs' },
          { text: 'The data and digital infrastructure the model is built on and runs on' }
        ],
        punchline: 'You can\'t govern what you don\'t control. If the model, weights, and hosting sit outside the country, governing the outputs alone doesn\'t bite.'
      },
      interaction: {
        openFloor: { type: 'word cloud', prompt: 'Who should own the CODA model once it is trained on many countries\' data? One word.' },
        toChat: 'Data protection versus data sovereignty: in one line, what\'s the difference in your view?',
        toCodaTeam: 'CODA team: what has to be written into the agreements now for "Southern-led" to be real later rather than aspirational?',
        facilitatorLanding: [
          'You can\'t govern what you don\'t control. If the model and hosting sit outside the country, governing the outputs alone doesn\'t bite.',
          'CODA already has a Governing Board, a Scientific Advisory Committee, and Technical Working Groups. That is project governance; AI governance also has to reach the data and the model.',
          'The COE ownership model is genuinely unresolved. Naming it here is the point, not smoothing it over.'
        ],
        optionalReVote: 'Lightning re-vote: govern the model, or the data and infrastructure.'
      }
    },

    perf: {
      name: 'Performance',
      short: 'CODA\'s August gate measures improvement over existing tools. Clearing it doesn\'t mean CODA is ready for routine deployment.',
      intro: {
        icon: '📊',
        concept: 'Measures of how well an AI tool performs on a task, typically derived from model evaluation on a test dataset.',
        ambiguity: 'CODA faces an August go/no-go gate. The bar is: beat the existing verbal-autopsy tool on under-five cases. That is not the same as "market-ready", which the target product profile puts years out.',
        question: 'Performance according to whom, measured how, and sufficient for what decision?'
      },
      conceptPrimer: {
        heading: 'Before you vote — quick concepts',
        items: [
          { term: 'Go/no-go gate', plain: 'The August 2026 decision point on whether CODA proceeds to the next phase.' },
          { term: 'Concordance / agreement', plain: 'How often two methods reach the same cause. Used to score accuracy against the gold standard.' },
          { term: 'Human certification is imperfect too', plain: 'Medical certification agrees with expert review only about 40–80% of the time.' }
        ]
      },
      formatA: {
        prompt: 'Four ways to measure Performance — which do you reach for when evaluating a health AI tool?',
        options: [
          { text: 'Clinical performance: how well the tool supports correct decisions in real practice, including agreement with expert reviewers.', source: 'Clinical evaluation' },
          { text: 'Model accuracy on a test dataset — precision, recall, F1, and confusion-matrix outputs.', source: 'ML / developer' },
          { text: 'Procurement and sustainability metrics: uptime, integration cost, frontline adoption, cost per case, operational reliability.', source: 'Health system / Ministry' },
          { text: 'Population-level impact: changes in detection or registration rates, equity across subgroups, and outcomes attributable to the tool.', source: 'Programme evaluation' }
        ]
      },
      formatB: {
        scenario: 'At the August go/no-go gate, CODA\'s evaluation on CHAMPS under-five cases shows roughly a 15% accuracy improvement over existing verbal-autopsy tools when using the full range of data sources, and about a 20% reduction in interview time, judged against DeCoDe expert-panel causes. The Governing Board must decide whether CODA is performing well enough to proceed to the Experimentation phase.',
        prompt: 'Are these the right performance measures for that decision?',
        options: [
          { text: 'Yes. Improvement over the existing tool against a rigorous gold standard is exactly the right bar for a go/no-go.' },
          { text: 'No. Accuracy versus a research gold standard doesn\'t tell the Board whether CODA will work in real CRVS workflows, for adults, or at scale.' },
          { text: 'Partly. Necessary for the gate, but not sufficient for any claim that CODA is "ready".' }
        ],
        discussion: [
          'The go/no-go bar and "market-ready" are different bars, potentially years apart. Minimum is not the gate.',
          'Accuracy against a research gold standard doesn\'t tell you whether the cause actually gets recorded differently in practice.',
          'If we compare CODA to human certification, we have to say which humans. Certification itself is 40–80% concordant with expert review.'
        ]
      },
      formatC: {
        prompt: 'When you hear "CODA reached X% accuracy", the first follow-up should be:',
        options: [
          { text: 'On which cases, and against which reference standard?' },
          { text: 'Does it change what actually gets recorded as the cause of death?' }
        ],
        punchline: 'Option A reads performance as a model property; option B reads it as a system property. Both are valid; the gap between them is where "building a tool" and "building adoption" separate.'
      },
      interaction: {
        openFloor: { type: 'open response', prompt: 'One metric you would insist on before saying CODA is "ready"?' },
        toChat: 'When a vendor says "X% accuracy", what is the first question you ask? Chat it.',
        toCodaTeam: 'CODA team: what performance claim can we honestly make in external communications today, and what can\'t we?',
        facilitatorLanding: [
          'The go/no-go bar and "market-ready" are different bars, potentially years apart. Minimum is not the gate.',
          'Accuracy against a research gold standard doesn\'t tell you whether the cause actually gets recorded differently in practice.',
          'If we compare CODA to human certification, we have to say which humans. Certification itself is 40–80% concordant with expert review.'
        ],
        optionalReVote: 'Lightning re-vote: "on which cases and standard?" or "does it change what gets recorded?"'
      }
    },

    hallu: {
      name: 'Hallucinations',
      short: 'CODA\'s confidence score is currently uncalibrated: a wrong cause can look as certain as a right one.',
      intro: {
        icon: '⚠️',
        concept: 'Outputs from a generative AI model that are factually incorrect, fabricated, or context-inappropriate, presented with the same confidence as correct answers.',
        ambiguity: 'CODA uses language-model components for the interview and the explanation, and a separate algorithm to assign cause. A confabulated but plausible cause is especially dangerous in cause-of-death work: it reads as correct, and CODA\'s confidence score is currently uncalibrated.',
        question: 'What is the right comparison: ideal performance, an average certifier, or no usable cause of death at all?'
      },
      conceptPrimer: {
        heading: 'Before you vote — quick concepts',
        items: [
          { term: 'Causal chain', plain: 'The ordered sequence of conditions leading to death, not just a single label. CODA drafts this for the certifier.' },
          { term: 'Confidence score', plain: 'A number the tool attaches to its own answer. If not calibrated, a confident number can be more misleading than no number.' },
          { term: 'Chain-of-thought explanation', plain: 'CODA\'s written account of why it reached a given cause — the reasoning the certifier reviews.' }
        ]
      },
      formatA: {
        prompt: 'Four takes on Hallucinations in AI — which best matches how you\'d define it to a colleague in this space?',
        options: [
          { text: 'A safety event: a generative AI output that is plausibly worded but medically wrong, with potential to cause harm in a health context.', source: 'Clinical safety' },
          { text: 'A context mismatch: an output that may be accurate against training data but wrong for the specific setting — different population, guideline version, or care context.', source: 'Deployment / context' },
          { text: 'A trust failure: any output a user reasonably acts on that is not traceable to a verifiable source, regardless of whether the underlying fact happens to be correct.', source: 'Public health implementer' },
          { text: 'An output that is factually incorrect, fabricated, or unsupported by training data, produced with the same confident tone as a correct answer.', source: 'ML / technical' }
        ]
      },
      formatB: {
        scenario: 'CODA presents a clinician with an underlying cause of death, an ICD-11 code, and a chain-of-thought explanation, together with a confidence score. In testing, the confidence score is found to be uncalibrated: CODA sometimes presents a wrong cause with the same high confidence and the same fluent, clinically coherent explanation as a correct one. Because the explanation reads well, reviewers are inclined to accept it. The team must decide how to handle this before the Experimentation phase.',
        prompt: 'How should the team respond?',
        options: [
          { text: 'Continue. A clinician signs off every case, so a plausible wrong answer will be caught.' },
          { text: 'Pause the confidence feature until scores are calibrated. An uncalibrated confidence number is worse than none.' },
          { text: 'Continue, but ground every output: show the specific interview statements and records each part of the causal chain rests on, so the reviewer can check the reasoning, not just the answer.' },
          { text: 'Reframe CODA\'s output as a structured summary for the certifier to reason from, not a cause-of-death "answer" to accept or reject.' }
        ],
        discussion: [
          'A plausible wrong cause is more dangerous than an obviously wrong one, because it invites the reviewer to nod along.',
          'Grounding — showing the exact evidence each part of the chain rests on — is what makes sign-off real rather than a rubber stamp.',
          'An uncalibrated confidence number can be worse than none. That is a live design decision for CODA right now.'
        ]
      },
      formatC: {
        prompt: 'For CODA, the most useful protection against confident-but-wrong outputs is:',
        options: [
          { text: 'A better model (fewer errors at the model level)' },
          { text: 'Better grounding (every conclusion traceable to a source the reviewer can check)' }
        ],
        punchline: 'Grounding is what lets a certifier catch the error and gives the system an audit trail. It\'s also what makes the human-in-the-loop guardrail real rather than nominal.'
      },
      interaction: {
        openFloor: { type: 'word cloud', prompt: 'What would make you trust — or distrust — a confident CODA answer? One word.' },
        toChat: 'Where have you seen a fluent, confident, wrong answer slip past review? Chat an example.',
        toCodaTeam: 'CODA team: given the language model is a query engine and the algorithm assigns the cause, where does the confabulation risk actually live?',
        facilitatorLanding: [
          'A plausible wrong cause is more dangerous than an obviously wrong one, because it invites the reviewer to nod along.',
          'Grounding — showing the exact evidence each part of the chain rests on — is what makes sign-off real rather than a rubber stamp.',
          'An uncalibrated confidence number can be worse than none. That is a live design decision for CODA right now.'
        ],
        optionalReVote: 'Lightning re-vote: better model, or better grounding.'
      }
    },

    bias: {
      name: 'Bias',
      short: 'Trained on CHAMPS under-five deaths, English only. Adults, rare causes, and other languages are out of scope.',
      intro: {
        icon: '⚖️',
        concept: 'Systematic patterns in AI outputs that affect some populations differently from others, often along lines of geography, language, income, or demographic group.',
        ambiguity: 'CODA\'s training data is under-five deaths from particular CHAMPS sites; the prototype supports English only; adults and injuries are out of scope; languages like Bangla and Brazilian Portuguese raise translation issues. Who is in the data, and who isn\'t?',
        question: 'Is this a model problem or a data-system problem, and does the answer change what we do about it?'
      },
      conceptPrimer: {
        heading: 'Before you vote — quick concepts',
        items: [
          { term: 'Training data', plain: 'What the model learned from. CODA learned from CHAMPS under-five deaths, so gaps in that data become gaps in CODA.' },
          { term: 'Cause list', plain: 'The set of causes CODA can assign, bounded by what is in the training data.' },
          { term: 'Coverage limits', plain: 'The prototype is English-only; adults and injuries are out of scope.' }
        ]
      },
      formatA: {
        prompt: 'Four framings of Bias in health AI — which is closest to how you think about it in your work?',
        options: [
          { text: 'A statistical property: systematic deviation between predictions and ground truth, measured by performance differences across subgroups.', source: 'ML / technical' },
          { text: 'A data problem: when training data under-represents certain populations, the model performs worse for those populations.', source: 'Data science' },
          { text: 'A systems problem: the populations least visible to digital health systems are most at risk of being further excluded by AI built on those systems.', source: 'Equity / public health' },
          { text: 'A clinical safety issue: when a tool produces systematically different outputs for people with similar needs but different demographic profiles, leading to inequitable care.', source: 'Clinical / patient-safety' }
        ]
      },
      formatB: {
        scenario: 'CODA is trained on CHAMPS under-five deaths and initially supports English-language interviews. When piloted more widely, it performs well for the causes and populations well represented in CHAMPS, but less well for deaths in older adults, for causes rare in the training data, and for interviews conducted in languages it was not built for, such as Bangla or Brazilian Portuguese.',
        prompt: 'Is CODA a biased tool?',
        options: [
          { text: 'Yes. It performs unequally across ages, causes, and language groups.' },
          { text: 'No. It performs as well as its training data allows. The gap is upstream — in what mortality data exists — not in the model.' },
          { text: 'Both. And only naming both leads to the right fix.' }
        ],
        discussion: [
          'CODA exists because most deaths here have no usable cause. Building on the little data that exists risks hard-coding those same blind spots.',
          'Where you locate the bias decides who you ask to fix it: retrain the model, or invest in the data systems.',
          '"Out of scope" is an honest limit today. It becomes an equity problem if CODA scales on it without closing the gap.'
        ]
      },
      formatC: {
        prompt: 'When CODA performs worse for an under-represented population, the primary problem is:',
        options: [
          { text: 'In the model' },
          { text: 'In the mortality-data systems the model was built on' }
        ],
        punchline: 'Where you locate the bias decides who you ask to fix it: retrain the model, or invest in the data infrastructure. That is a governance and funding question as much as a technical one.'
      },
      interaction: {
        openFloor: { type: 'open response', prompt: 'Whose deaths are most at risk of staying invisible to a tool like CODA?' },
        toChat: 'Model problem or data-system problem? Say which and why in one line.',
        toCodaTeam: 'CODA team: which gap worries you most first — adults, rare causes, or languages — and who closes it?',
        facilitatorLanding: [
          'Where you locate the bias decides who you ask to fix it: retrain the model, or invest in the data systems.',
          'CODA exists because most deaths here have no usable cause. Building on the little data that exists risks hard-coding those same blind spots.',
          '"Out of scope" is an honest limit today. It becomes an equity problem if CODA scales on it without closing the gap.'
        ],
        optionalReVote: 'Lightning re-vote: in the model, or in the data system.'
      }
    }

  };

  window.WEBINAR_TERM_KEYS = Object.keys(window.WEBINAR_TERMS);

  window.WEBINAR_CONFIG = {
    mode: 'coda',
    title: 'AI Terminology for Public Health',
    subtitle: 'The same AI terms, different meanings — read through CODA',
    hook: 'Does "human in the loop" mean the same thing to an algorithm developer, an M&E specialist, and a community surveillance agent standing in a bereaved family\'s home?',
    shortlistHeading: 'Which CODA terms next?',
    shortlistPrompt: 'Which terms should we put through CODA next? Choose two.',
    ambiguityLabel: 'In CODA',
    closeText: 'AI terminology shapes how we design, govern, and implement public health solutions. For each term: what does it certify, who is responsible for what it claims, and what decision does it inform? Every scenario today is a real question CODA is working through right now.',

    // Opening slides injected before Human in the Loop
    introStages: ['coda_primer', 'coda_glossary', 'coda_familiarity'],

    // Familiarity poll config
    familiarity: {
      heading: 'Before we begin',
      prompt: 'We\'ll use these terms in their AI sense today — where "hallucinations" means model errors, not clinical symptoms, and "bias" refers to training data, not personal prejudice. For each one — where are you starting from?',
      levels: ['New to me', 'Heard of it', 'Can explain it', 'Know it well'],
      colors: ['#94A3B8', '#7C3AED', '#059669', '#2563EB']
    },

    primer: {
      heading: 'CODA in ninety seconds',
      points: [
        'Only about 1 in 5 deaths worldwide has meaningful cause-of-death information. 54% of WHO Member States have low-quality, very-low-quality, or no cause-of-death data — and the gap is worst where the burden of death is highest.',
        'CODA is an AI-powered decision-support tool for cause-of-death determination. It brings together clinical records, family interviews, diagnostic results, and local surveillance, and returns a draft determination with an explanation. It is decision support, not automation: a qualified person reviews, edits, and signs every determination.',
        'Two settings. In a facility, a clinician must certify the death; CODA reads the record and drafts the causal chain for review. In the community, where most deaths in many lower-income settings happen with no clinician, CODA runs an adaptive voice interview and stops once it can determine a cause with sufficient confidence.',
        'Currently: prototyping through an August 2026 go/no-go gate. Trained on CHAMPS under-five deaths; adults and injuries are out of current scope. Experimentation phase begins November 2026 at Centres of Excellence in Africa, South Asia, and Brazil.'
      ],
      framingNote: 'Language to hold throughout: CODA augments and guides rather than replaces; a qualified human reviews and signs; current evidence is under-five only.',
      statsSource: 'WHO World Health Statistics 2026 (Chapter 3)'
    },

    runGuidance: 'Sixty minutes, solo. Per-term budget ~14 minutes: concept primer + definition vote (4 min), scenario vote (4 min), open discussion + landing (6 min). Keep ~5 minutes to close on the three throughline questions. A fourth term only fits as a lightning-only round if you are ahead.',

    flow: [
      { step: 1, label: 'Welcome, CODA primer, quick glossary' },
      { step: 2, label: 'Familiarity check — where is the room starting from?' },
      { step: 3, label: 'Human in the Loop (fixed anchor term)' },
      { step: 4, label: 'Audience votes: which two terms next?' },
      { step: 5, label: 'Term 2 (top-voted)' },
      { step: 6, label: 'Term 3 (second-voted)' },
      { step: 7, label: 'Close' }
    ],

    glossary: {
      heading: 'Quick glossary',
      note: 'Share early, revisit as needed.',
      items: [
        { term: 'CRVS', plain: 'Civil Registration and Vital Statistics: the government system that records births and deaths and produces the statistics built on them. Cause of death is part of the death record.' },
        { term: 'Cause-of-death certification', plain: 'The formal record of what someone died of, made by an authorised person. It needs the underlying cause plus the sequence of conditions that led to death.' },
        { term: 'Underlying cause of death', plain: 'The disease or injury that started the chain of events leading to death. It is the single cause used for statistics.' },
        { term: 'MCCD', plain: 'Medical Certificate of Cause of Death: the standard form a clinician completes to certify a death in a facility.' },
        { term: 'Verbal autopsy', plain: 'Where no clinician saw the death, a structured interview with a relative about the final illness, used to infer the probable cause.' },
        { term: 'Mortality surveillance', plain: 'Ongoing collection of data on who is dying and of what, used to guide public-health decisions.' },
        { term: 'MITS / post-mortem testing', plain: 'Minimally invasive tissue sampling: small samples taken after death and lab-tested to establish cause with high accuracy. Used in surveillance, not routine care.' },
        { term: 'CHAMPS', plain: 'A surveillance network that investigates under-five deaths across several countries using post-mortem sampling and expert review. It is where CODA\'s training data comes from.' },
        { term: 'DeCoDe panel / gold standard', plain: 'The CHAMPS expert panel that weighs all the evidence to set the most rigorous available cause of death. CODA is measured against it.' },
        { term: 'ICD-11', plain: 'WHO\'s international classification of diseases: the standard codes used to record causes of death. CODA outputs ICD-11 codes.' },
        { term: 'Human in the loop / sign-off', plain: 'A qualified person reviews the AI\'s output and takes responsibility for it before it becomes the record.' }
      ]
    }
  };

})();
