// terms.js — content for the AI Terminology Webinar voting app.
// Each term has: name, short, intro, formatA, formatB, formatC.
// Definitions paraphrased; stakeholder lens labels are deliberately generic.

window.WEBINAR_TERMS = {
  hitl: {
    name: 'Human in the Loop',
    short: 'When the human you\'re looping in doesn\'t exist in the setting where the AI is deployed.',
    intro: {
      icon: '👤',
      concept: 'A system in which a human provides oversight, validation, or correction of an AI system\'s outputs at defined points, retaining decision authority.',
      ambiguity: 'Generic definitions assume a qualified specialist is available to review AI outputs. In many public health settings, the person physically present is a community health worker or nurse who may lack the expertise the term implies.',
      question: 'Is any human presence enough to call it "human in the loop", or does the human need the expertise to meaningfully override the AI?'
    },
    formatA: {
      prompt: 'Four definitions of Human in the Loop. Select the one closest to how YOU use the term.',
      options: [
        { text: 'A system in which a person provides oversight, validation, or correction of an AI system\'s outputs at one or more defined points in its operation, with the human retaining decision authority.', source: 'Regulatory framing' },
        { text: 'An AI deployment pattern in which a clinician reviews and either accepts, modifies, or rejects each AI recommendation before it affects patient care.', source: 'Clinical user lens' },
        { text: 'A workflow design choice in which AI handles routine cases and escalates uncertain or high-risk cases to a human reviewer, optimising for the limited time a human can spend.', source: 'Developer / implementer lens' },
        { text: 'A risk-mitigation requirement under which a human must be involved in or accountable for an AI-influenced decision, including in settings where the specialist who would otherwise make the decision is absent.', source: 'Public health implementer lens' }
      ]
    },
    formatB: {
      scenario: 'Your organization supports an AI tool that reads chest X-rays for TB, deployed in a district hospital in a rural area. There is no radiologist at the hospital. The nearest one is 6 hours away by road. A trained nurse runs the X-ray, the AI flags the result as "high probability TB," and the patient is started on treatment based on the AI output and the nurse\'s clinical assessment.',
      prompt: 'Is this "Human in the Loop"?',
      options: [
        { text: 'Yes. The nurse is the human, and she is in the loop.' },
        { text: 'No. HITL as the term is normally used means a clinician with the expertise to override the AI, which the nurse does not have.' },
        { text: 'It depends on what the term is being used to certify.' }
      ],
      discussion: [
        'If we accept that the nurse is the "human in the loop," is the term doing any work? What is it actually certifying?',
        'If we say it\'s not HITL, are we saying this deployment shouldn\'t happen? Because in many districts, the alternative is no diagnostic at all.',
        'Should the term distinguish between "human supervising AI" (clinician oversight) and "human enabled by AI" (frontline worker using AI to operate beyond their scope)? They\'re being conflated under one label.'
      ]
    },
    formatC: {
      prompt: 'Is "Human in the Loop" primarily a safety mechanism or a workforce-substitution mechanism?',
      options: [
        { text: 'A safety mechanism' },
        { text: 'A workforce-substitution mechanism' }
      ],
      punchline: 'Expected split: roughly even. The discussion punchline is that the term is being asked to do both at once, which is why it remains so contested in implementation contexts.'
    }
  },

  perf: {
    name: 'Performance Metrics',
    short: 'Sensitivity tells the clinician one thing. Population-level coverage and equity tell the programme manager another.',
    intro: {
      icon: '📊',
      concept: 'Quantitative measures of how well an AI tool performs on a given task, typically derived from model evaluation on a test dataset.',
      ambiguity: 'A model\'s accuracy on a benchmark and the programme impact on a population are not the same claim. Standard metrics satisfy developers and regulators. Ministries of health need different evidence entirely.',
      question: 'Performance according to whom, measured how, and sufficient for what decision?'
    },
    formatA: {
      prompt: 'Four ways to think about Performance Metrics for an AI tool in public health. Select the one closest to how YOU understand the term.',
      options: [
        { text: 'Quantitative measures of model accuracy on a test dataset, typically including sensitivity, specificity, AUC, F1 score, and confusion matrix outputs.', source: 'ML / developer lens' },
        { text: 'Measures of clinical performance: how well the tool supports correct clinical decisions in real practice, including agreement with expert reviewers and impact on diagnostic confidence.', source: 'Clinical evaluation lens' },
        { text: 'Measures of population-level impact: change in detection rates, equity of detection across subpopulations, time-to-treatment, and downstream health outcomes attributable to the tool.', source: 'Programme evaluation lens' },
        { text: 'Measures relevant to procurement and sustainability: uptime, integration cost, frontline user adoption, total cost per case detected, and operational reliability.', source: 'Health system / Ministry decision-maker lens' }
      ]
    },
    formatB: {
      scenario: 'Your organization is reporting on a maternal health WhatsApp chatbot deployed in partnership with the Ministry of Health. After 18 months, the vendor reports: 92% accuracy on intent recognition, 88% user satisfaction in a 500-person sample, 1.2 million messages handled. The Ministry is deciding whether to absorb the chatbot into its routine programme budget.',
      prompt: 'Are these the right performance metrics for the Ministry\'s decision?',
      options: [
        { text: 'Yes. These are standard, widely accepted measures.' },
        { text: 'No. They don\'t tell the Ministry what it needs to know.' },
        { text: 'Partly. They\'re necessary but not sufficient.' }
      ],
      discussion: [
        'What\'s missing? (Common chat answers: equity of access across language groups, behaviour change outcomes, harm cases, performance on sensitive topics like SRH, cost per enrolled user, sustainability after donor exit.)',
        'If you were advising the Ministry, what is the ONE additional metric you would require before sign-off?',
        'Whose job is it to produce the metrics that get presented? The vendor? The implementing partner? The Ministry? Who SHOULD it be?'
      ]
    },
    formatC: {
      prompt: 'When you hear "this AI tool achieved 95% performance," what should be the FIRST follow-up question?',
      options: [
        { text: 'On what dataset?' },
        { text: 'What changed in programme outcomes?' }
      ],
      punchline: 'The split tells you whether the audience is reading "performance" as a model property or a system and programme property. Both are valid; the gap matters.'
    }
  },

  hallu: {
    name: 'GenAI Hallucinations',
    short: 'A confidently-stated answer that is not grounded in fact. Easy to spot in trivia; much harder when the user is a frontline health worker.',
    intro: {
      icon: '⚠️',
      concept: 'Outputs from a generative AI model that are factually incorrect, fabricated, or context-inappropriate, presented with the same confidence as correct answers.',
      ambiguity: 'In high-resource settings, a wrong AI output is a patient safety event with a clear responsible party. In public health, frontline workers may lack the reference materials to detect errors, and accountability is rarely clear.',
      question: 'What is the right comparison group: ideal performance, average clinician performance, or no guidance at all?'
    },
    formatA: {
      prompt: 'Four ways to define a GenAI hallucination. Select the one closest to how YOU use the term.',
      options: [
        { text: 'An output from a generative model that is factually incorrect, fabricated, or unsupported by its training data, produced with a tone of confidence indistinguishable from a correct answer.', source: 'ML / technical lens' },
        { text: 'A safety event in which a generative AI tool, deployed in a clinical or health-information context, gives advice that is plausibly worded but medically wrong, with potential to cause harm.', source: 'Clinical safety lens' },
        { text: 'A failure mode of the model-context fit: an output that may be technically accurate against the model\'s training data but is wrong in the specific context where the user is reading it (wrong country, wrong guideline version, wrong population).', source: 'Deployment / context lens' },
        { text: 'A trust failure: any output that a user reasonably acts upon, but which is not traceable to a verifiable source, regardless of whether the underlying fact happens to be correct.', source: 'Public health implementer lens' }
      ]
    },
    formatB: {
      scenario: 'A generative AI chatbot is being piloted with community health workers to support quick clinical guidance during home visits. During the pilot, an evaluator finds that for roughly 3% of queries the chatbot gives an answer that contradicts the national clinical guideline. In roughly 1% of queries it contradicts WHO guidance. In all of these cases the answer is presented with the same confidence as the correct answers. The programme team is debating whether to continue scaling the pilot.',
      prompt: 'How should the programme team respond?',
      options: [
        { text: 'Continue scaling. 96% guideline-aligned is better than what most CHWs can achieve unaided, and humans hallucinate too.' },
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
      prompt: 'For a GenAI tool used by frontline health workers, the most useful mitigation is:',
      options: [
        { text: 'Better models (fewer hallucinations at the model level)' },
        { text: 'Better grounding (answers tied to a verifiable source the worker can check)' }
      ],
      punchline: 'The technical conversation tends to focus on the first option. For deployment in real programmes, grounding is what allows a CHW or supervisor to catch errors and what gives a Ministry the audit trail it needs.'
    }
  },

  bias: {
    name: 'Bias / Fairness',
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
        { text: 'Bias is a statistical property of a model: systematic deviation between predictions and ground truth, typically measured by performance differences across demographic subgroups.', source: 'ML / technical lens' },
        { text: 'Bias is a training data problem: when the data used to build a model under-represents certain populations, the model\'s performance on those populations will be poorer.', source: 'Data science lens' },
        { text: 'Bias is a clinical safety issue: when an AI tool produces systematically different recommendations for patients with similar clinical needs but different demographic profiles, leading to inequitable care.', source: 'Clinical / patient-safety lens' },
        { text: 'Bias is a system-level problem of who is in the data at all: the populations least visible to digital health systems are the ones most at risk of being further excluded by AI tools built on those systems.', source: 'Equity / public health lens' }
      ]
    },
    formatB: {
      scenario: 'A national early-warning system uses AI to flag districts at elevated risk of cholera outbreaks, drawing on routine health facility data, mobile-phone movement patterns, and rainfall data. Six months in, an evaluation finds: the model correctly flagged 9 of 11 outbreaks in urban districts, but missed 4 of 5 outbreaks in nomadic and remote rural areas.',
      prompt: 'Is this a biased model?',
      options: [
        { text: 'Yes. The model performs unequally across populations.' },
        { text: 'No. The model is doing the best it can with the data it has. The problem is upstream.' },
        { text: 'Both. And only naming both is useful.' }
      ],
      discussion: [
        'If the answer is "both," how do we communicate that to a Ministry deciding whether to keep using the tool?',
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

  rwe: {
    name: 'Real World Evidence',
    short: 'In LMIC public health, "real world" often means the only world. There was never a controlled trial.',
    intro: {
      icon: '🌍',
      concept: 'Evidence about a health intervention derived from analysis of real-world data generated outside randomised controlled trials, typically from routine care, programme delivery, or administrative data.',
      ambiguity: 'In many LMIC public health settings, a controlled trial was never run and may never be feasible. Programme data is the only available evidence. The question is whether it is sufficient for the decisions being made.',
      question: 'Sufficient evidence for what decision, and sufficient according to whose standard?'
    },
    formatA: {
      prompt: 'Four definitions of Real World Evidence. Select the one closest to how YOU use the term.',
      options: [
        { text: 'Clinical evidence regarding the use and potential benefits or risks of a medical product derived from analysis of real-world data, typically EHRs, claims, registries, and patient-reported outcomes, generated outside randomised trials.', source: 'Regulatory lens (FDA-style)' },
        { text: 'Evidence collected from routine use of a tool after deployment, used to monitor whether the tool continues to perform as intended in the populations and settings where it is being used.', source: 'Post-market surveillance lens' },
        { text: 'Operational data generated by a digital health programme (usage logs, user feedback, error rates, programme outcomes) that demonstrates whether the tool is working in practice, regardless of whether it was ever validated through formal trials.', source: 'Implementer lens' },
        { text: 'The only evidence available, because the controlled-trial infrastructure doesn\'t exist in the setting. What is gathered from routine programme delivery is by necessity what counts as evidence sufficient for decisions about scale.', source: 'LMIC public health lens' }
      ]
    },
    formatB: {
      scenario: 'Your organization has supported a WhatsApp-based maternal health chatbot for three years. Programme data shows: 4 million enrolled users, retention curves, message engagement, self-reported satisfaction, and (through linkage with facility data) some indication of antenatal care attendance among enrolled users. There has never been a randomised trial. The Ministry of Health is deciding whether to absorb the chatbot into its routine budget.',
      prompt: 'Is the available evidence sufficient to make that decision?',
      options: [
        { text: 'Yes. Three years of real programme data is more meaningful than a one-year trial would be.' },
        { text: 'No. Without a counterfactual, you can\'t attribute the outcomes to the chatbot.' },
        { text: 'Yes for some decisions (continued operation), no for others (claims of impact, scale to new geographies).' }
      ],
      discussion: [
        'Who is qualified to judge whether real-world evidence is "sufficient"? The Ministry? Your organization? The donor? An external evaluator?',
        'If the answer is "wait for a trial," who funds and runs it? In what timeframe? And what happens to the programme in the meantime?',
        'Are we holding RWE for AI tools to a stricter standard than we hold RWE for other public health interventions like SBCC programmes?'
      ]
    },
    formatC: {
      prompt: 'For an AI tool deployed in a public health programme, "real world evidence" should primarily be evidence of:',
      options: [
        { text: 'Whether the tool works as the model says it does.' },
        { text: 'Whether programme outcomes are improved with the tool present.' }
      ],
      punchline: 'Option A is what most evaluations measure. Option B is what Ministries actually want to know. Implementing partners are often the only actor positioned to produce Option B.'
    }
  },

  gov: {
    name: 'AI Governance',
    short: '"AI governance" often means model risk management. In public health it has to also mean data sovereignty and who controls the architecture.',
    intro: {
      icon: '🏛️',
      concept: 'The frameworks, processes, regulations, and accountability structures that guide how AI systems are built, deployed, monitored, and controlled.',
      ambiguity: 'Regulatory frameworks focus on model risk. Public health practitioners need to govern the underlying data pipelines, digital infrastructure ownership, and procurement terms that determine who controls AI tools over time.',
      question: 'Can you meaningfully govern an AI tool without governing the infrastructure it runs on?'
    },
    formatA: {
      prompt: 'Four definitions of AI Governance in the context of health. Select the one closest to how YOU understand the term.',
      options: [
        { text: 'The internal processes by which an organization managing or developing an AI system documents its decisions, manages its risks, and ensures accountability for the system\'s behaviour.', source: 'Corporate / ML governance lens' },
        { text: 'The set of laws, regulations, and oversight bodies that authorise, constrain, and audit the deployment of AI in health, including data protection, model approval, and post-market surveillance.', source: 'Regulatory lens' },
        { text: 'The framework of policies, ethical principles, transparency requirements, and consent mechanisms that ensure AI in health respects rights, prevents harm, and operates within publicly accountable boundaries.', source: 'Ethics / human rights lens' },
        { text: 'Government ownership and public stewardship of the foundational digital architecture (identifiers, registries, data pipelines, hosting, procurement terms) that determines what AI can be built on, who controls it, and who benefits from it over time.', source: 'Data sovereignty lens' }
      ]
    },
    formatB: {
      scenario: 'An AI tool for HIV cohort retention, built by a third-party vendor, has been operating for 4 years, integrated with the national HIV programme. Your organization is the implementing partner, supporting deployment, training, and M&E, but neither the developer nor the host of the tool. The donor has announced funding will end in 18 months. The Ministry discovers: the model is hosted on the vendor\'s cloud infrastructure; the training data and fine-tuned model weights are the vendor\'s IP; continued operation after funding ends would require a commercial licence the Ministry cannot afford.',
      prompt: 'Is this an AI governance failure?',
      options: [
        { text: 'Yes. The procurement and contracting were inadequate.' },
        { text: 'Yes, but the failure was upstream, in the absence of a national framework that would have set the procurement terms.' },
        { text: 'No. This is a sustainability failure, not a governance one.' }
      ],
      discussion: [
        'If we accept this is a governance failure, who in the country should have been positioned to prevent it? Was that role even funded? Did your organization, as the implementing partner, have a role to play?',
        'What contractual or policy terms, set at the start, would have prevented this outcome?',
        'Is it realistic for individual ministries to negotiate this, or does it require regional or peer-network leverage that implementing partners could help broker?'
      ]
    },
    formatC: {
      prompt: 'When we say "AI governance," the primary subject of the verb should be:',
      options: [
        { text: 'The AI model and its developer' },
        { text: 'The data and digital infrastructure the AI runs on' }
      ],
      punchline: 'The regulatory community has spent the last 5 years building frameworks for Option A. The argument from public health is that without Option B, Option A doesn\'t bite. You can\'t govern what you don\'t control.'
    }
  }
};

window.WEBINAR_TERM_KEYS = Object.keys(window.WEBINAR_TERMS);
