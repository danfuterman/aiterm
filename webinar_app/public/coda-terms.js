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
      formatA: {
        prompt: 'Four definitions of Human in the Loop. Vote for the one closest to how YOU use the term in your work.',
        options: [
          { text: 'A risk-mitigation requirement under which a human must be involved in or accountable for an AI-driven decision, including in settings where a specialist who would otherwise make the decision is absent.', source: 'Public health implementer lens' },
          { text: 'An AI deployment pattern in which a clinician reviews and either accepts, modifies, or rejects each AI recommendation before it affects care or the record.', source: 'Clinical user lens' },
          { text: 'A workflow design choice in which AI handles routine cases and escalates uncertain or high-risk cases to a human reviewer, optimising for the limited time a human can spend.', source: 'Developer / implementer lens' },
          { text: 'A system in which a person retains decision authority through oversight, validation, or correction of an AI system\'s outputs at one or more defined points in its operation.', source: 'Regulatory framing' }
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
      formatA: {
        prompt: 'Four definitions of Validation for an AI tool in health. Which reflects how YOU would apply the term?',
        options: [
          { text: 'A continuous process rather than a one-time event: ongoing assessment of whether a deployed model continues to perform as intended as populations, data systems, and care-delivery patterns change over time.', source: 'Post-market surveillance lens' },
          { text: 'Testing a trained model on a dataset not used during development, drawn from a different institution, population, or time period, to assess whether performance holds beyond the original context.', source: 'Regulatory / technical lens' },
          { text: 'Assessing whether a model validated internally still performs in a specific local context, on the actual populations, facilities, and data infrastructure where it will be used.', source: 'Public health implementer lens' },
          { text: 'A one-time pre-deployment requirement: evidence that a model performs adequately on an independent test set before it is approved for clinical or programme use.', source: 'Procurement / approval lens' }
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
      formatA: {
        prompt: 'Four definitions of AI Governance in the context of public health. Which matches what YOU mean by it?',
        options: [
          { text: 'The internal processes by which an organisation managing or developing an AI system documents its decisions, manages its risks, and ensures accountability for the system\'s behaviour.', source: 'AI/ML governance lens' },
          { text: 'The laws, regulations, and oversight bodies that authorise, constrain, and audit the deployment of AI in health, including data protection, model approval, and post-market surveillance.', source: 'Regulatory lens' },
          { text: 'The policies, ethical principles, transparency requirements, and consent mechanisms that ensure AI in health respects rights, prevents harm, and operates within publicly accountable boundaries.', source: 'Ethics / human rights lens' },
          { text: 'Government ownership and public stewardship of the foundational digital architecture — identifiers, registries, data pipelines, hosting, procurement terms — that determines what AI can be built on, who controls it, and who benefits over time.', source: 'Data sovereignty lens' }
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
      formatA: {
        prompt: 'Four ways to think about Performance for an AI tool in public health. Which reflects how YOU evaluate it?',
        options: [
          { text: 'Clinical performance: how well the tool supports correct clinical decisions in real practice, including agreement with expert reviewers.', source: 'Clinical evaluation lens' },
          { text: 'Model accuracy on a test dataset, typically precision, recall, F1, and confusion-matrix outputs.', source: 'ML / developer lens' },
          { text: 'Procurement and sustainability measures: uptime, integration cost, frontline adoption, total cost per case, operational reliability.', source: 'Health system / Ministry decision-maker lens' },
          { text: 'Population-level impact: change in detection or registration rates, equity across subpopulations, time-to-result, and downstream outcomes attributable to the tool.', source: 'Programme evaluation lens' }
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
          'If we compare CODA to human certification, we have to say which humans. Certification itself is only 40 to 80% concordant with expert review.'
        ]
      },
      formatC: {
        prompt: 'When you hear "CODA reached X% accuracy", the first follow-up should be:',
        options: [
          { text: 'On which cases, and against which reference standard?' },
          { text: 'Does it change what actually gets recorded as the cause of death?' }
        ],
        punchline: 'Option A reads performance as a model property; option B reads it as a system property. Both are valid; the gap between them is where "building a tool" and "building adoption" separate.'
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
      formatA: {
        prompt: 'Four ways to define a hallucination. Which is closest to how YOU use the term?',
        options: [
          { text: 'A safety event in which a generative AI tool, in a clinical or health-information context, gives an output that is plausibly worded but medically wrong, with potential to cause harm.', source: 'Clinical safety lens' },
          { text: 'A model-context failure: an output that may be accurate against the model\'s training data but is wrong in the specific context where it is read — wrong population, wrong guideline version, wrong setting.', source: 'Deployment / context lens' },
          { text: 'A trust failure: any output a user reasonably acts on but which is not traceable to a verifiable source, regardless of whether the underlying fact happens to be correct.', source: 'Public health implementer lens' },
          { text: 'An output that is factually incorrect, fabricated, or unsupported by the training data, produced with a tone of confidence indistinguishable from a correct answer.', source: 'ML / technical lens' }
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
      formatA: {
        prompt: 'Four framings of Bias / Fairness in AI for health. Which is closest to how YOU understand it?',
        options: [
          { text: 'A statistical property of a model: systematic deviation between predictions and ground truth, typically measured by performance differences across subgroups.', source: 'ML / technical lens' },
          { text: 'A training-data problem: when the data used to build a model under-represents certain populations, its performance on those populations will be poorer.', source: 'Data science lens' },
          { text: 'A system-level problem of who is in the data at all: the populations least visible to digital health systems are the ones most at risk of being further excluded by AI built on those systems.', source: 'Equity / public health lens' },
          { text: 'A clinical safety issue: when a tool produces systematically different recommendations for people with similar needs but different profiles, leading to inequitable outcomes.', source: 'Clinical / patient-safety lens' }
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
    primer: {
      heading: 'CODA in ninety seconds',
      points: [
        'Only about 1 in 5 deaths worldwide has meaningful cause-of-death information. 54% of WHO Member States have low-quality, very-low-quality, or no cause-of-death data.',
        'CODA is an AI-powered decision-support tool for cause-of-death determination. A qualified person reviews, edits, and signs every determination. It is decision support, not automation.',
        'It is trained on CHAMPS surveillance data: deaths of children under five. Adults and injuries are out of current scope.',
        'Phase: prototyping through an August 2026 go/no-go gate; then Experimentation from November 2026 at Centres of Excellence in Africa, South Asia, and Brazil.'
      ]
    }
  };

})();
