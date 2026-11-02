// Hand-written intros for the tag archives that are indexed.
// A tag page that says only "N posts about X" is a doorway page. Each of these
// says what the topic actually covers, what is in the archive, and answers the
// three questions someone landing on the archive is most likely to have.

export const TAG_COPY = {
  astrology: {
    intro: `Astrology here means the mechanics before the interpretation: where the planets actually are, what a transit is, and how a chart is built from a date, a time and a place. The guides in this archive are written for people who want to understand the system rather than be told what it means about them.`,
    faq: [
      ["Do I need my birth time for this?", "For a full birth chart, yes — the rising sign and house positions change roughly every two hours, so without a time you can get the Sun, Moon and planets but not the ascendant. Everything else on the site works from a date alone."],
      ["Is astrology supported by evidence?", "No, and we do not pretend otherwise. It is a symbolic system with a long history and real internal logic. We treat it as a framework for reflection rather than a source of predictions, and we say so on every page that touches it."],
      ["What is the difference between a sun sign and a birth chart?", "A sun sign is one data point: where the Sun was on the day you were born. A birth chart is the whole picture — all the planets, the ascendant and the houses — which is why two people with the same sun sign can have quite different charts."],
    ],
  },
  "2026": {
    intro: `Everything dated to 2026 in one place: the year's eclipses, retrograde windows, moon phases and the astrological dates people search for as they approach. Dates are computed from ephemeris data rather than copied, so where a source disagrees by a day it is usually a time-zone conversion rather than an error.`,
    faq: [
      ["Are the 2026 dates confirmed?", "Astronomical ones are — they are computed and do not depend on an announcement. Dates for events that are announced rather than calculated are marked as expected until they are confirmed."],
      ["Why does a date differ between sites?", "Nearly always time zone. A full moon at 23:40 UTC is already the next calendar day in Sydney and still the previous evening in Los Angeles. Check which zone a site is quoting."],
      ["Will the dates change?", "The astronomical ones will not. Moon-sighting observances can shift by a day, and those are labelled as expected on the individual pages."],
    ],
  },
  transits: {
    intro: `A transit is a planet moving through the sky now and forming an angle to where a planet sat in your birth chart. This archive covers what transits are, how the major ones are usually read, and — the part most sites skip — what the mechanism does not do.`,
    faq: [
      ["What is a transit, in plain terms?", "Planets keep moving after you are born. When a moving planet forms an angle to one in your birth chart, that is a transit. It is a relationship between two positions, not an event."],
      ["How long does a transit last?", "It depends entirely on the planet. The Moon's transits last hours; Pluto's can last a couple of years because of how slowly it moves and how often it appears to reverse."],
      ["Can a transit predict an event?", "No. A transit describes a period with a particular character. The most that can honestly be said is that certain themes are more likely to be on your mind — not that a specific thing will happen."],
    ],
  },
  spirituality: {
    intro: `Spirituality content here is approached the same way as everything else: what the practice actually involves, what people report getting from it, and where the claims outrun the evidence. No page in this archive asks you to believe something on the strength of the writing.`,
    faq: [
      ["What counts as spirituality on this site?", "Practices and frameworks people use for meaning: meditation, ritual, energy work, manifestation, and the reflective side of astrology. The test is whether it is something a person does, not something they are told."],
      ["Do you endorse any of these practices?", "We describe them. Where a practice has documented benefits — meditation is the clearest case — we say so and cite it. Where a claim has no evidence behind it, we say that too."],
      ["Is any of this a substitute for professional help?", "No. Nothing in this archive is a treatment for a mental health condition, and any page that drifts toward that is one we would rather not have published."],
    ],
  },
  "psychic-readings": {
    intro: `Readings are the most searched-for and least evidence-backed thing we cover, which is exactly why the guides here focus on the mechanics: how the services are billed, what a refund actually requires, and how to tell a careful reader from a script. Several of these pages cost us affiliate revenue to publish.`,
    faq: [
      ["Are psychic readings accurate?", "There is no evidence that they are, and we do not score them on accuracy. What we can assess — and do — is whether the billing is honest and whether the refund works."],
      ["Why do readings feel so accurate?", "The Forer effect: vague, flattering, individually-addressed descriptions are rated as highly accurate even when everyone is given identical text. Personalisation is what makes it land, not accuracy."],
      ["What is the most common problem with these services?", "Per-minute billing that escalates, and auto-renewal on credit packs or memberships. Both are noted in each review where they apply."],
    ],
  },
  fiverr: {
    intro: `Fiverr content covers the marketplace as a buyer experiences it: what the fees actually add up to, which gig categories are worth the money, and where the gap between a listing and a delivery tends to open up. The fee calculator on this site was built because the headline price is not the price you pay.`,
    faq: [
      ["What does Fiverr charge buyers?", "A service fee on the order value plus a flat charge on smaller orders. The calculator on this site applies both in order and shows the components separately, because the percentage and the flat fee behave differently as the order grows."],
      ["Are cheaper gigs worse?", "Not always, but the correlation is real at the very bottom. The useful question is what a revision costs you in time — a cheap gig that needs four rounds is not cheap."],
      ["How do refunds work?", "Fiverr holds payment until you accept delivery, which makes disputes easier than on most marketplaces. If a delivery is not what was agreed, do not accept it — open a resolution instead."],
    ],
  },
  calculators: {
    intro: `The calculators on this site exist to answer one question each, and they run entirely in your browser — nothing you type is uploaded. This archive covers what each one computes and, where it matters, the formula behind it so you can check the answer by hand.`,
    faq: [
      ["Do these calculators store what I enter?", "No. Everything is computed on your device and discarded when you close the tab. There is no account and no email gate."],
      ["How accurate are they?", "For arithmetic — fees, dates, countdowns — they are exact. Where a result depends on a judgement or an estimate, the page says which inputs are estimates."],
      ["Can I use them on my phone?", "Yes. They are built to work at any width and do not need anything beyond a browser."],
    ],
  },
  rituals: {
    intro: `Rituals here are described as practices rather than mechanisms: what people actually do, how long it takes, and what the honest account of the experience tends to be. We cover them because people find them useful, and we are careful not to dress that up as a claim about outcomes.`,
    faq: [
      ["Do rituals work?", "As structured attention, often yes — a deliberate practice changes how you think about something. As a mechanism that changes external events, there is no evidence, and we will not imply there is."],
      ["How long should a ritual take?", "Long enough to feel deliberate and short enough that you will repeat it. The practices that survive are the ones that fit into a day rather than the ones that need a free afternoon."],
      ["Do I need any equipment?", "Almost never. Where a practice traditionally uses objects, the guides say what is essential and what is decoration."],
    ],
  },
  manifestation: {
    intro: `Manifestation content here is written from one position: there is no evidence that thinking about an outcome causes it, and there is reasonable evidence that structured reflection changes what you notice and what you do about it. The guides in this archive take the second seriously and decline to claim the first.`,
    faq: [
      ["Does manifestation work?", "Not as a causal mechanism. What does reliably happen is that writing something down and returning to it daily changes your attention and your follow-through — which is not nothing, but it is not magic either."],
      ["Why review these programmes at all?", "Because people buy them, and the useful information is which ones are honestly sold. We score on pricing transparency, refund reliability and whether the marketing makes claims it cannot support."],
      ["What should I watch for?", "Upsell chains behind a low entry price, and any promise of specific financial outcomes. Those two signals predict a bad purchase better than anything else in the category."],
    ],
  },
  reviews: {
    intro: `Reviews on this site are scored against a published rubric and the score is published even when it is unflattering. This archive collects them, including several products we link to and still rate below 7.5 — which is the part that makes the scoring worth reading.`,
    faq: [
      ["How do you score products?", "A weighted average across four sub-scores: quality and depth, value for money, delivery and experience, and support and guarantee. The weights and the reasoning are set out on the methodology page."],
      ["Do affiliate commissions affect scores?", "No. Several products on this site are linked despite scoring below 7.5. Placement follows the score, not the commission rate."],
      ["Do you test everything yourselves?", "Where we can, yes, and those reviews are labelled. Where a review is built from research and vendor documentation, that is labelled too — pretending the second is the first is where review sites lose credibility."],
    ],
  },
  beginners: {
    intro: `Starting points. These guides assume nothing: what a birth chart is, what a retrograde actually is, how to read a moon phase calendar without needing to know any terminology first. If the rest of the site assumes more than you have, start here.`,
    faq: [
      ["Where should I begin?", "With the moon phases if you want something you can check against the sky tonight, or the birth chart guides if you want to understand your own chart. Both are self-contained."],
      ["Do I need to memorise anything?", "No. The terminology is there to make the system precise, not to gate it. Every guide defines terms as it goes."],
      ["How much of this requires buying anything?", "None of it. Every tool on this site is free and runs in your browser, and the guides do not lead to a purchase."],
    ],
  },
  tarot: {
    intro: `Tarot here is covered as a symbolic system with a real structure — seventy-eight cards, suits, numerology, and a set of spreads with different jobs — rather than as a prediction device. Knowing the structure makes the practice more interesting, not less.`,
    faq: [
      ["Can tarot predict the future?", "No, and we do not treat it as though it could. It is a structured prompt for thinking about a situation, which is a genuine use and a different claim."],
      ["Do I need to be given a deck?", "No. The tradition that you must be gifted a deck is a modern invention, not a historical rule."],
      ["How many cards should I use?", "One for a daily focus, three for a situation with a beginning, middle and end. Larger spreads are for when you already know the cards well enough to hold that many meanings at once."],
    ],
  },
  "birth-chart": {
    intro: `A birth chart is a map of where the planets were at the moment you were born, calculated for the place as well as the time. This archive covers what each component means and why the time of birth matters more than most people expect.`,
    faq: [
      ["Why does my birth time matter?", "The ascendant and the house positions change roughly every two hours. Without a time you can still get the Sun, Moon and planets, but not the rising sign or the houses."],
      ["What is a rising sign?", "The sign on the eastern horizon at the moment of your birth. It is the fastest-moving part of the chart, which is why it needs an accurate time and why it is often described as the most personal."],
      ["Do I need an exact place of birth?", "Yes, for the houses. Longitude and latitude determine which part of the sky was rising, so a city is usually enough but a country on its own is not."],
    ],
  },
  guides: {
    intro: `The long-form reference material: dated astronomical guides, explained mechanics, and the how-to pieces that other pages on the site link back to. These are the pages written to be read twice — once for the answer, and once for why. Where a guide is date-specific it is maintained rather than left to rot, so a page about a coming eclipse still reads correctly when the year turns over.`,
    faq: [
      ["How are these different from the blog posts?", "They are maintained. A dated guide gets updated when the dates change, where a post is published once and left as it was."],
      ["Do they assume prior knowledge?", "No. Anything that needs a term defined gets it defined on the page rather than linked elsewhere."],
      ["How often are they updated?", "Astronomical guides whenever the underlying data is refined, which is rare. Dated guides for announced events get updated when the announcement changes."],
    ],
  },
  numerology: {
    intro: `Numerology on this site is taught as arithmetic first: the reduction rules, what a life path number is, and why two people with the same date get the same figure. Everything is checkable by hand, which is the point — if you cannot reproduce the calculation, the interpretation is not worth much.`,
    faq: [
      ["How is a life path number calculated?", "The day, month and year of birth are each reduced to a single digit, then added and reduced again. The numbers 11, 22 and 33 are preserved as master numbers rather than broken down further."],
      ["Is numerology accurate?", "It is deterministic — the same input always gives the same output — which is not the same as being accurate about anything. It is a system for reflection, and the arithmetic is shown so you can judge for yourself."],
      ["Why do different sites give me different numbers?", "Usually a different reduction rule. Some reduce the full year first, some reduce each part first, and some treat master numbers differently. The rule used is stated on every page here."],
    ],
  },
  "online-readings": {
    intro: `What buying a reading online actually involves: the formats, how the billing works, what a realistic turnaround is, and the specific things that go wrong often enough to check for in advance. Written for someone about to spend money rather than someone already convinced. These guides are written from the buyer side: what you are actually paying for, how long delivery takes, and the specific clauses worth reading before you enter card details.`,
    faq: [
      ["How much does an online reading cost?", "It ranges from a few dollars for an automated report to several hundred for live time. The variable is whether a person is involved, and the price does not reliably track the quality."],
      ["How do I avoid being overcharged?", "Check the billing unit before you start. Per-minute rates escalate quickly, and the clock often starts when you join the queue rather than when the reading begins."],
      ["Can I get a refund?", "Through ClickBank, usually: the standard window is 60 days and you can claim it directly rather than waiting for the vendor to reply. Keep your order number."],
    ],
  },
  "moon-phases": {
    intro: `The eight phases, what each one is in astronomical terms, and the exact peak times for the full and new moons. A full moon is a moment rather than a night, which is why the date can differ by a day depending on where you are reading from. The peak times listed in these guides are exact moments rather than whole nights, converted so you can see them in your own time zone without doing the arithmetic yourself.`,
    faq: [
      ["What exactly is a full moon?", "The instant the Moon and Sun are opposite each other in ecliptic longitude. It lasts a moment, though the Moon looks full for roughly a day either side."],
      ["Why do sources disagree on the date?", "Time zone. A full moon late in the day UTC is already the next calendar date further east and still the previous date further west."],
      ["What is a blue moon?", "Two full moons in a single calendar month. It happens every two to three years because the synodic month is shorter than most calendar months."],
    ],
  },
  "meteor-shower": {
    intro: `When the Earth passes through debris left by a comet, and what determines whether it is worth staying up for. The two variables that matter most are the peak time and how much moonlight there is — and the second one is why the same shower is excellent one year and invisible the next. Each shower guide gives the peak date and time, the radiant point, and — the number that actually decides whether it is worth staying up — how much moonlight there will be that year.`,
    faq: [
      ["What time of night is best?", "After midnight, ideally in the hour or two before dawn. Before midnight you are on the trailing side of the Earth and see fewer meteors."],
      ["Do I need a telescope?", "No, and it would get in the way. Meteors are best seen with the naked eye from a dark site with the widest view of sky you can find."],
      ["Why are the quoted rates so much higher than what I see?", "The zenithal hourly rate is a theoretical maximum under a perfectly dark sky with the radiant directly overhead. Realistic counts from a suburb are far below it."],
    ],
  },
};

const norm = (s) =>
  String(s).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function tagIntro(tag) {
  return TAG_COPY[norm(tag)]?.intro || TAG_COPY[String(tag)]?.intro || null;
}

export function tagFaq(tag) {
  return TAG_COPY[norm(tag)]?.faq || TAG_COPY[String(tag)]?.faq || null;
}
