// terms.js - content for the AI Terminology Webinar voting app.
// Each term has: name, short, intro, formatA, formatB, formatC.
// Definitions paraphrased; stakeholder lens labels are deliberately generic.

window.WEBINAR_TERMS = {
  hitl: {
    name: 'Human in the Loop',
    short: 'When the human you\'re looping in doesn\'t exist in the setting where the AI is deployed.',
    intro: {
      icon: '👤',
      concept: 'A system in which a human provides oversight, validation, or correction of an AI system\'s outputs at defined points, retaining decision authority.',
      ambiguity: 'The term assumes a qualified specialist is available to review AI outputs. In many public and community health settings, the person physically present may lack the expertise the term implies.',
      question: 'Is any human presence enough to call it "human in the loop", or does the human need the expertise to meaningfully override the AI?'
    },
    formatA: {
      prompt: 'Four definitions of Human in the Loop. Select the one closest to how YOU understand the term.',
      options: [
        { text: 'A risk-mitigation requirement under which a human must be involved in or accountable for AI-driven decisions, including in settings where a specialist who would otherwise make the decision is absent.', source: 'Public health implementer lens' },
        { text: 'An AI deployment pattern in which a clinician reviews and either accepts, modifies, or rejects each AI recommendation before it affects patient care.', source: 'Clinical user lens' },
        { text: 'A workflow design choice in which AI handles routine cases and escalates uncertain or high-risk cases to a human reviewer, optimising for the limited time a human can spend.', source: 'Developer / implementer lens' },
        { text: 'A system in which a person retains decision authority through oversight, validation, or correction of an AI system\'s outputs at one or more defined points in its operation.', source: 'Regulatory framing' }
      ]
    },
    formatB: {
      scenario: 'Your organization supports an AI tool that reads chest X-rays for diagnosis of TB. The tool is deployed in a district hospital with no radiologist on site. A trained nurse runs the X-ray, the AI flags the result as "high probability TB" and the patient is started on treatment based on the AI\'s output and the nurse\'s clinical assessment.',
      prompt: 'Is this "Human in the Loop"?',
      options: [
        { text: 'Yes. The nurse is the human, and she is in the loop.' },
        { text: 'No. The human should be a specialist with the expertise to validate the AI\'s outputs, which the nurse does not have.' },
        { text: 'It depends on what the term is being used to certify.' }
      ],
      discussion: [
        'If we accept that the nurse is the human in the loop, is the term doing any work? What is it actually certifying?',
        'If we say it\'s not HITL, are we saying this deployment shouldn\'t happen? Because in many districts, the alternative is no diagnostic at all.',
        'Should the term distinguish between "human supervising AI" (clinician oversight) and "human enabled by AI" (frontline worker using AI to operate beyond their scope)? They\'re being conflated under one label.'
      ]
    },
    formatC: {
      prompt: 'Is Human in the Loop primarily a safety mechanism or a workforce-substitution mechanism?',
      options: [
        { text: 'A safety mechanism' },
        { text: 'A workforce-substitution mechanism' }
      ],
      punchline: 'Expected split: roughly even. The discussion punchline is that the term is being asked to do both at once, which is why it remains so contested in implementation contexts.'
    }
  },

  perf: {
    name: 'Performance',
    short: 'Sensitivity tells the clinician one thing. Population-level coverage and equity tell the program manager another.',
    intro: {
      icon: '📊',
      concept: 'Measures of how well an AI tool performs on a given task, typically derived from model evaluation on a test dataset.',
      ambiguity: 'An AI model\'s accuracy against a benchmark and a health program\'s impact on a population are not the same claim. What metrics are needed to support evidence across algorithmic accuracy and public health utility + impact?',
      question: 'Performance according to whom, measured how, and sufficient for what decision?'
    },
    formatA: {
      prompt: 'Here are four ways to think about performance for an AI tool in public health. Select the one closest to how YOU understand the term.',
      options: [
        { text: 'Measures of clinical performance: how well the tool supports correct clinical decisions in real practice, including agreement with expert reviewers.', source: 'Clinical evaluation lens' },
        { text: 'Measures of model accuracy on a test dataset, typically including precision, recall, F1 scores, and confusion matrix outputs.', source: 'ML / developer lens' },
        { text: 'Measures relevant to procurement and sustainability: uptime, integration cost, frontline user adoption, total cost per case and operational reliability.', source: 'Health system / Ministry decision-maker lens' },
        { text: 'Measures of population-level impact: change in detection rates,time-to-treatment, quality of treatment and downstream health outcomes attributable to the tool.', source: 'program evaluation lens' }
      ]
    },
    formatB: {
      scenario: 'Your organization has implemented a maternal health WhatsApp chatbot deployed in partnership with the Ministry of Health. After 18 months, you report 92% accuracy on intent recognition, 88% user satisfaction in a 500-person sample, and 1.2 million messages handled. The Ministry is deciding whether to absorb the chatbot into its routine program budget.',
      prompt: 'Are these the right performance metrics for the Ministry\'s decision?',
      options: [
        { text: 'Yes. These are standard, widely accepted measures.' },
        { text: 'No. They don\'t tell the Ministry what it needs to know.' },
        { text: 'Partly. They\'re necessary but not sufficient.' }
      ],
      discussion: [
        'What\'s missing? (Common chat answers: equity of access across language groups, behaviour change outcomes, harm cases, performance on sensitive topics like SRH, cost per enrolled user, sustainability after donor exit.)',
        'If you were advising the Ministry, what is the ONE additional metric you would require before sign-off?',
        'Whose job should it be to produce the metrics that matter? The product developer? The implementing partner? The Ministry of Health?'
      ]
    },
    formatC: {
      prompt: 'When you hear "this AI tool achieved 95% accuracy", what should the first follow-up question be?',
      options: [
        { text: 'On what dataset?' },
        { text: 'What changed in program outcomes?' }
      ],
      punchline: 'The split tells you whether the audience is reading "performance" as a model property or a system and program property. Both are valid; the gap matters.'
    }
  },

  hallu: {
    name: 'Hallucinations',
    short: 'A confidently-stated answer that is not grounded in fact. Easy to spot in trivia, much harder when the user is a frontline health worker.',
    intro: {
      icon: '⚠️',
      concept: 'Outputs from a generative AI model that are factually incorrect, fabricated, or context-inappropriate, presented with the same confidence as correct answers.',
      ambiguity: 'In high-resource settings, a wrong AI output is a patient safety event with a clear responsible party. In public health, frontline workers may lack the reference materials to detect errors, and accountability is rarely clear.',
      question: 'What is the right comparison group: ideal performance, average clinician performance, or no guidance at all?'
    },
    formatA: {
      prompt: 'Four ways to define Hallucinations. Select the one closest to how YOU use the term.',
      options: [
        { text: 'A safety event in which a generative AI tool, deployed in a clinical or health-information context, gives advice that is plausibly worded but medically wrong, with potential to cause harm.', source: 'Clinical safety lens' },
        { text: 'A failure mode of the model-context fit: an output that may be technically accurate against the model\'s training data but is wrong in the specific context where the user is reading it (wrong country, wrong guideline version, wrong population).', source: 'Deployment / context lens' },
        { text: 'A trust failure: any output that a user reasonably acts upon, but which is not traceable to a verifiable source, regardless of whether the underlying fact happens to be correct.', source: 'Public health implementer lens' },
        { text: 'An output from a generative model that is factually incorrect, fabricated, or unsupported by its training data, produced with a tone of confidence indistinguishable from a correct answer.', source: 'ML / technical lens' }
      ]
    },
    formatB: {
      scenario: 'A generative AI chatbot is being piloted with Community Health Workers to support quick clinical guidance during home visits. During the pilot, an evaluator finds that for roughly 3% of queries the chatbot gives an answer that contradicts the national clinical guideline. In roughly 1% of queries it contradicts WHO guidance. In all of these cases the answer is presented with the same confidence as the correct answers. The program team is debating whether to continue scaling the pilot.',
      prompt: 'How should the program team respond?',
      options: [
        { text: 'Continue scaling. 96% guideline-aligned is better than what can be achieve witout the tool.' },
        { text: 'Pause scaling until the rate of guideline-contradicting answers is brought below a defined threshold.' },
        { text: 'Continue scaling, but with mandatory grounding (RAG against the national guideline) and a visible source citation on every answer.' },
        { text: 'Reframe the tool as a search aid that surfaces sources, not as a question-answering tool.' }
      ],
      discussion: [
        'Where does responsibility sit when a CHW acts on a hallucinated answer? The CHW? The implementing partner? The vendor? The Ministry that approved the pilot?',
        'Is "hallucination rate" even the right metric, or does it hide more than it reveals (e.g. severity, equity of error distribution, types of question that trigger errors)?',
        'Are we asking generative AI to clear a bar that we never asked older job-aids or printed protocols to clear? What\'s the right comparison group?'
      ]
    },
    formatC: {
      prompt: 'For a Generative AI tool used by Community Health Workers, the most useful mitigation against hallucinations is:',
      options: [
        { text: 'Better models (fewer hallucinations at the model level)' },
        { text: 'Better grounding (answers tied to a verifiable source that can be checked)' }
      ],
      punchline: 'The technical conversation tends to focus on the first option. For deployment in real programs, grounding is what allows a CHW or supervisor to catch errors and what gives a Ministry the audit trail it needs.'
    }
  },

  bias: {
    name: 'Bias',
    short: 'Bias is often discussed as a model property. In public health it\'s also a system property: who is in the data system at all.',
    intro: {
      icon: '⚖️',
      concept: 'Systematic patterns in AI outputs that affect some populations differently from others, often along lines of geography, language, income, or demographic group.',
      ambiguity: 'Where you locate the source of bias determines who you ask to fix it. A model-bias framing points toward retraining. A data infrastructure framing points toward surveillance investment and governance reform.',
      question: 'Is this a model problem or a data system problem, and does the answer change what we do about it?'
    },
    formatA: {
      prompt: 'Four framings of Bias / Fairness in AI for health. Select the one closest to how YOU understand the term.',
      options: [
        { text: 'A statistical property of a model: systematic deviation between predictions and ground truth, typically measured by performance differences across demographic subgroups.', source: 'ML / technical lens' },
        { text: 'A training data problem: when the data used to build a model under-represents certain populations, the model\'s performance on those populations will be poorer.', source: 'Data science lens' },
        { text: 'A system-level problem of who is in the data at all: the populations least visible to digital health systems are the ones most at risk of being further excluded by AI tools built on those systems.', source: 'Equity / public health lens' },
        { text: 'A clinical safety issue: when an AI tool produces systematically different recommendations for patients with similar clinical needs but different demographic profiles, leading to inequitable care.', source: 'Clinical / patient-safety lens' }
      ]
    },
    formatB: {
      scenario: 'A national early-warning system uses AI to flag districts at elevated risk of cholera outbreaks, drawing on routine health facility data, mobile-phone movement patterns, and rainfall data. Six months in, an evaluation finds: the model correctly flagged 9 of 11 outbreaks in urban districts, but missed 4 of 5 outbreaks in remote rural areas.',
      prompt: 'Is this a biased model?',
      options: [
        { text: 'Yes. The model performs unequally across populations.' },
        { text: 'No. The model is doing the best it can with the data it has. The problem is upstream.' },
        { text: 'Both. And only naming both is useful.' }
      ],
      discussion: [
        'If the answer is both, how do we communicate that to a Ministry deciding whether to keep using the tool?',
        'Who is responsible for fixing it? The vendor? The Ministry\'s data team? The donor that funded the underlying surveillance system? Your organization?',
        'Is calling this "model bias" actually unhelpful, because it routes the conversation toward retraining when the real fix is investment in the data infrastructure?'
      ]
    },
    formatC: {
      prompt: 'When an AI tool performs worse for a marginalised population, the primary problem is:',
      options: [
        { text: 'In the model' },
        { text: 'In the data system the model was built on' }
      ],
      punchline: 'Where you locate the bias determines who you ask to fix it. That\'s a governance question, not a technical one, and it shapes what implementing partners advocate for.'
    }
  },

  val: {
    name: 'Validation',
    short: 'A model assessed in a particular setting. Deployed in another setting, does it perform as well?',
    intro: {
      icon: '✅',
      concept: 'The process of testing an AI model to confirm it performs as intended, typically by evaluating it on data it has not previously seen.',
      ambiguity: 'Validation is often treated as a one-time pre-deployment step conducted in the development setting. For implementing organisations deploying tools across different populations and contexts, the more pressing question is whether that validation holds locally.',
      question: 'If a tool was validated somewhere else, how do you know it works here?'
    },
    formatA: {
      prompt: 'Four definitions of Validation for an AI tool in health. Which one most closely reflects how YOU would apply the term in your work?',
      options: [
        { text: 'A continuous process rather than a one-time event: ongoing assessment of whether a deployed model continues to perform as intended as populations, data systems, and care delivery patterns change over time.', source: 'Post-market surveillance lens' },
        { text: 'The process of testing a trained AI model on a dataset not used during development, drawn from a different institution, population, or time period, to assess whether its performance holds beyond the original development context.', source: 'Regulatory / technical lens' },
        { text: 'The process of assessing whether a model validated internally still performs in a local context on specific populations, facilities and data infrastructure.', source: 'Public health implementer lens' },
        { text: 'A one-time pre-deployment requirement: evidence that a model performs adequately on an independent test set before it is approved for clinical or program use.', source: 'Procurement / approval lens' }
      ]
    },
    formatB: {
      scenario: 'Your organisation is supporting the rollout of an AI clinical scribe across a network of public health facilities. The product documentation states the tool has been validated with high accuracy on clinical consultation transcripts. Your team establishes that all validation datasets came from private hospital settings in two high-income countries with structured consultation formats. Your facilities run high-volume consultations with patient histories that include conditions underrepresented in the training data. Clinicians are required to review and sign off each AI-generated note before it enters the patient record.',
      prompt: 'Is this tool validated for this deployment?',
      options: [
        { text: 'Yes - the vendor met a recognised standard for validation. What was done is what the term requires.' },
        { text: 'No - a separate local validation study would be needed before this deployment can be trusted.' },
        { text: 'The term is being used to mean two different things, and neither party is wrong on their own terms.' }
      ],
      discussion: [
        'If the clinician signs off each note, does that substitute for local validation, or does it transfer the risk to the clinician?',
        'The vendor says validated. The procurement team read that as applicable to this context. Is that a miscommunication, or the predictable result of a term that doesn\'t require context to be specified?',
        'What would a minimum viable local validation study look like for an AI scribe in this setting, and who should fund it?'
      ]
    },
    formatC: {
      prompt: 'When an AI tool is described as validated, the responsibility for ensuring this applies to the deployment context sits with:',
      options: [
        { text: 'The product or software vendor, to demonstrate the validation is applicable to the local deployment context.' },
        { text: 'The implementing organisation, to conduct or commission local validation before deployment.' }
      ],
      punchline: 'In practice it sits with neither. It falls into the gap between them, and the patient or population bears the risk, with responsibility for funding and conducting it unresolved.'
    }
  },

  gov: {
    name: 'AI Governance',
    short: 'AI governance often covers model risk management. In public health, should it also cover data sovereignty and who controls the architecture?',
    intro: {
      icon: '🏛️',
      concept: 'The frameworks, processes, regulations, and accountability structures that guide how AI systems are built, deployed, monitored, and controlled.',
      ambiguity: 'Regulatory frameworks focus on model risk management. Public health practitioners need to govern the underlying data pipelines, digital infrastructure ownership, and procurement terms that determine who controls AI tools over time.',
      question: 'Can you meaningfully govern an AI tool without governing the infrastructure it runs on?'
    },
    formatA: {
      prompt: 'Four definitions of AI Governance in the context of public health. Which one best matches how YOU think it should apply?',
      options: [
        { text: 'The internal processes by which an organisation managing or developing an AI system documents its decisions, manages its risks, and ensures accountability for the system\'s behaviour.', source: 'AI/ML governance lens' },
        { text: 'The set of laws, regulations, and oversight bodies that authorise, constrain, and audit the deployment of AI in health, including data protection, model approval, and post-market surveillance.', source: 'Regulatory lens' },
        { text: 'Government ownership and public stewardship of the foundational digital architecture that determines what AI can be built on, who controls it, and who benefits from it over time.', source: 'Data sovereignty lens' },
        { text: 'The framework of policies, ethical principles, transparency requirements, and consent mechanisms that ensure AI in health respects rights, prevents harm, and operates within publicly accountable boundaries.', source: 'Ethics lens' }
      ]
    },
    formatB: {
      scenario: 'Your organisation supports a national AI program for maternal health in a country. Over three years, the program generates a large dataset of labelled clinical interactions, outcome data, and patient records. The vendor that built and hosts the AI tool uses this data to train an improved global model, licensed commercially to health systems in other countries. The data sharing agreement signed at the start of the program permitted the vendor to use anonymised data for model improvement, but made no distinction between internal improvement and commercial application.',
      prompt: 'Is this an AI governance failure?',
      options: [
        { text: 'Yes — the vendor exploited a data sharing clause that the Ministry did not intend to include commercial use.' },
        { text: 'Yes — but the failure was upstream, in the absence of a national framework that could have classified training data as a sovereign asset.' },
        { text: 'No — the data sharing agreement was signed and complied with. This is a contracting failure, not a governance one.' }
      ],
      discussion: [
        'This issue only exists because the data was used to train a model that creates commercial value elsewhere. Does AI governance as a term — as it is currently used — cover this? If not, what would?',
        'What is the difference between data protection (a legal concept most countries have frameworks for) and data sovereignty (a governance concept most countries do not)? Is that distinction doing real work here?',
        'What role can implementing partners play in helping Ministries negotiate data terms that protect sovereign interests — and is that role currently funded or expected?'
      ]
    },
    formatC: {
      prompt: 'When we say AI governance, the primary subject should be:',
      options: [
        { text: 'The AI model and its behaviour.' },
        { text: 'The data and digital infrastructure the AI runs on.' }
      ],
      punchline: 'The regulatory community has spent the last five years building frameworks for (a). The argument from public health implementation is that without (b), (a) doesn\'t bite — you cannot govern what you do not control.'
    }

    
  }
};

window.WEBINAR_TERM_KEYS = Object.keys(window.WEBINAR_TERMS);
