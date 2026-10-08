/* storying.app/stories -- the library browse page.
   Reads data/stories.json (generated from Misc/Story-Sets.xlsx) and renders three views of
   the same list: books (one horizontal scroll rail, one column per book of the Bible, with
   two levels of collapsible grouping), list, and a four-column grid. Filtering and search
   happen client side, and opening a story shows its own detail page inside this same page, so
   the whole thing stays static and account-free.

   This file only builds the page. It is handed the shared CSS and asset paths by
   build-site.mjs so the two pages cannot drift apart on palette or typography. Note that
   the shared CSS is the pitch page's, and it styles some very generic selectors: anything
   here that could collide (.chips and its descendant spans, for instance) is deliberately
   namespaced with an f- or t- prefix rather than reusing the shared name. */

const OT = [
  ['Pentateuch', ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy']],
  ['Historical', ['Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
    '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther']],
  ['Wisdom', ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Songs']],
  ['Prophets', ['Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
    'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai',
    'Zechariah', 'Malachi']],
];
const NT = [
  ['Gospels', ['Matthew', 'Mark', 'Luke', 'John']],
  ['Acts', ['Acts']],
  ['Epistles', ['Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy',
    '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John',
    '2 John', '3 John', 'Jude']],
  ['Revelation', ['Revelation']],
];
export const TESTAMENTS = [['Old Testament', OT], ['New Testament', NT]];

/* Short forms for the tiles. Anything not listed keeps its full name. */
const ABBR = {
  Genesis: 'Gen', Exodus: 'Ex', Leviticus: 'Lev', Numbers: 'Num', Deuteronomy: 'Deut',
  Joshua: 'Josh', Judges: 'Judg', '1 Samuel': '1 Sam', '2 Samuel': '2 Sam',
  '1 Kings': '1 Kgs', '2 Kings': '2 Kgs', '1 Chronicles': '1 Chr', '2 Chronicles': '2 Chr',
  Nehemiah: 'Neh', Esther: 'Est', Ecclesiastes: 'Eccl', 'Song of Songs': 'Song',
  Isaiah: 'Isa', Jeremiah: 'Jer', Lamentations: 'Lam', Ezekiel: 'Ezek', Daniel: 'Dan',
  Obadiah: 'Obad', Habakkuk: 'Hab', Zephaniah: 'Zeph', Zechariah: 'Zech', Malachi: 'Mal',
  Matthew: 'Matt', Romans: 'Rom', '1 Corinthians': '1 Cor', '2 Corinthians': '2 Cor',
  Galatians: 'Gal', Ephesians: 'Eph', Philippians: 'Phil', Colossians: 'Col',
  '1 Thessalonians': '1 Thess', '2 Thessalonians': '2 Thess', '1 Timothy': '1 Tim',
  '2 Timothy': '2 Tim', Philemon: 'Phlm', Hebrews: 'Heb', Revelation: 'Rev',
};

/* Each set's tile art, so a set reads the same here as it does on the home page. */
const SET_ICON = {
  'Creation to Christ': 'c2c-app-logo-icon.webp',
  '7 Commands': 'story-set-icons/7-commands.webp',
  'Stories of Hope': 'story-set-icons/stories-of-hope.webp',
  'Acts': 'story-set-icons/acts.webp',
  'OT Stories': 'story-set-icons/old-testament.webp',
  'Sacrifice Stories': 'story-set-icons/sacrifice-stories-2.webp',
  "Paul's Journeys": 'story-set-icons/pauls-journeys.webp',
  'Baptism Hammer': 'story-set-icons/baptism-hammer.webp',
  'Sermon on the Mount': 'story-set-icons/sermon-on-the-mount.webp',
  'C2C Full': 'story-set-icons/c2c-full.webp',
  /* 7 Signs of John: the 7 miracles traditionally read as John's own "signs" structure
     (water into wine, healing the official's son, healing at Bethesda, feeding the 5,000,
     walking on water, healing the man born blind, raising Lazarus). Two of the seven are
     filed under Matthew/Mark as their main account (Feeding the 5,000, Jesus Walks on
     Water) with John as a par entry, same as everywhere else in this file; membership
     doesn't care which book a story's primary account sits under. No SET_ORDER entry
     needed: GOSPEL_ORDER already puts these 7 ids in exactly signs-1-through-7 order
     (110, 150, 210, 560, 570, 680, 850), so the shared chronological default is correct
     for free. Kingdom of God: every story tagged with that theme in `g`, gathered into its
     own set per Brett's request -- no curated order yet, so it falls through to the
     default too. */
  '7 Signs of John': 'story-set-icons/7-signs-of-john.webp',
  'Kingdom of God': 'story-set-icons/kingdom-of-god.webp',
};

/* The only real story art that exists today: the 13 covers running on creationtochrist.app,
   resized to 560px WebP in assets/stories/lib/. Keyed by "Book|Title" rather than by the
   spreadsheet's row id, since those ids move whenever the sheet is regenerated. Every key
   here is checked against the data at build time, so a retitled story fails loudly instead
   of quietly dropping its picture. */
const STORY_IMG = {
  'Genesis|Creation': '1-creation-of-the-physical-world.webp',
  /* A composite of Isaiah 14:12-15, Ezekiel 28:12-19, Luke 10:18 and Revelation 12:7-9 --
     filed under Revelation 12:7-9 as its primary account (the other three as par[]) since
     that is the only one of the four that is an actual narrated event rather than a poetic
     oracle or a single aside, even though the story's narrative POSITION is meant to be
     right before The First Sin (see its id's placement in SET_ORDER's 'C2C Full' array and
     in the data/stories.json array itself, both independent of this `b`/`r` choice) -- so it
     shows up in Books view under Revelation, not Genesis, on purpose. Brett's own addition,
     not sourced from Misc/Story-Sets.xlsx's Master List tab like every other story in this
     file (hence the hand-picked id, B100, well clear of the real sheet's B4-B48 range) and
     still pending Todd's review as of when this was added -- see CLAUDE.md. */
  "Revelation|Satan's Rebellion": 'satans-rebellion.webp',
  'Genesis|The First Sin': '2-the-man-and-woman-sin.webp',
  'Matthew|Birth of Jesus': '3-the-birth-of-jesus.webp',
  /* Was 'Matthew|The Paralytic Man' until the Stories By Set sheet's own reference for
     this event (Luke 5:17-26) became this story's primary account instead of Matthew
     9:1-8, per Brett; Matthew and Mark are now its parallels. Cover art was later
     replaced too, to match the newer flat-illustration style. */
  'Luke|The Paralyzed Man': 'the-paralyzed-man.webp',
  'Mark|Jesus Calms the Storm': '5-jesus-calms-the-storm.webp',
  'Mark|The Man with Many Demons': '6-the-man-with-many-demons.webp',
  /* Replaced the original numbered cover with a new one in the flat-illustration style. */
  "Mark|Jairus' Daughter and the Bleeding Woman": 'jairus-daughter-bleeding-woman.webp',
  'Mark|Feeding the 5,000': '8-jesus-feeds-5000.webp',
  /* Replaced the original numbered cover with a new one in the flat-illustration style. */
  'John|The Samaritan Woman': 'the-samaritan-woman.webp',
  /* Replaced the original numbered cover with a new one in the flat-illustration style. */
  'John|Man Born Blind': 'the-man-born-blind.webp',
  /* Replaced the original numbered cover with a new one in the flat-illustration style. */
  'Luke|Zacchaeus': 'zacchaeus.webp',
  'Matthew|The Death of Jesus': '12-the-death-of-jesus.webp',
  'Matthew|The Resurrection': '13-resurrection.webp',
  'Exodus|The Ten Commandments': 'exodus-ten-commandments.webp',
  'Genesis|The First People': 'genesis-the-first-people.webp',
  /* Replaced the original sunburst-themed cover with a new one in the flat-illustration
     style, as part of the C2C Full art pass below. */
  'John|Lazarus Raised from the Dead': 'john-lazarus-raised.webp',
  'Luke|The Lost Son': 'luke-the-lost-son.webp',
  'Acts|The Apostles Persecuted': 'acts-apostles-persecuted.webp',
  'Acts|Philip and the Ethiopian': 'acts-philip-and-the-ethiopian.webp',
  'Mark|The Widow\'s Offering': 'mark-the-widows-offering.webp',
  /* Sermon on the Mount (18) and Paul's Journeys (27): first sets to get a covers-as-a-
     family treatment rather than one-off art. Each shares a fixed backdrop and palette
     per set (a maroon hillside-teaching scene for SOTM, a navy Mediterranean-map scene for
     Paul's Journeys, both matching those sets' own tile-border and icon colors) with a
     distinct, text-free symbol pulled from that story's own passage -- e.g. birds and
     lilies for Do Not Worry (Matt 6:26-28), a log in an eye for Judging Others (Matt 7:3-5),
     Lydia's dye vat (Acts 16:14). Paul's Journeys covers also carry a plain numeral (1/2/3)
     for which missionary journey the story belongs to -- a digit rather than a word, so it
     doesn't need translation. Filenames get a -som/-pj suffix only where the same title
     exists as a different story elsewhere (e.g. Luke's own "Love Your Enemies"), to keep
     the file list legible; it has no effect on lookup, which is by "Book|Title". */
  'Matthew|The Beatitudes': 'the-beatitudes.webp',
  'Matthew|Salt and Light': 'salt-and-light.webp',
  'Matthew|Jesus and the Law': 'jesus-and-the-law.webp',
  'Matthew|Murder in the Heart': 'murder-in-the-heart.webp',
  'Matthew|Adultery in the Heart': 'adultery-in-the-heart.webp',
  'Matthew|Divorce and Remarriage': 'divorce-and-remarriage-som.webp',
  'Matthew|Keeping Your Word': 'keeping-your-word.webp',
  'Matthew|Turn the Other Cheek': 'turn-the-other-cheek.webp',
  'Matthew|Love Your Enemies': 'love-your-enemies-som.webp',
  'Matthew|How To Give': 'giving-to-the-needy.webp',
  'Matthew|How To Pray': 'the-lords-prayer.webp',
  'Matthew|How To Fast': 'fasting.webp',
  'Matthew|Treasures in Heaven': 'treasures-in-heaven-som.webp',
  'Matthew|Do Not Worry': 'do-not-worry-som.webp',
  'Matthew|Judging Others': 'judging-others.webp',
  'Matthew|Ask, Seek, Knock': 'ask-seek-knock-som.webp',
  'Matthew|Entering the Kingdom': 'entering-the-kingdom.webp',
  'Matthew|Build Your House on the Rock': 'build-your-house-on-the-rock-som.webp',
  'Acts|Paul and Barnabas Sent Out': 'paul-and-barnabas-sent-out.webp',
  'Acts|Paul makes a Sorcerer Blind': 'paul-makes-a-sorcerer-blind.webp',
  "Acts|Paul's Sermon to the Jews": 'pauls-sermon-to-the-jews.webp',
  'Acts|Growth and Persecution': 'growth-and-persecution.webp',
  'Acts|Mistaken for Gods': 'mistaken-for-gods.webp',
  'Acts|Completing the Mission': 'completing-the-mission.webp',
  'Acts|A Fight in the Church': 'a-fight-in-the-church.webp',
  'Acts|Paul and Barnabas Part Ways': 'paul-and-barnabas-part-ways.webp',
  'Acts|Paul Selects Timothy': 'paul-selects-timothy.webp',
  'Acts|A Call to New Ministry': 'a-call-to-new-ministry.webp',
  "Acts|Lydia Believes": 'lydia-believes.webp',
  'Acts|The Fortune Teller': 'the-fortune-teller.webp',
  'Acts|Paul and Silas Escape from Prison': 'paul-and-silas-escape-from-prison.webp',
  "Acts|The Attack of Jason's House": 'the-attack-of-jasons-house.webp',
  'Acts|The Bereans Love the Bible!': 'the-bereans-love-the-bible.webp',
  "Acts|Paul's Sermon to the Gentiles": 'pauls-sermon-to-the-gentiles.webp',
  'Acts|"I have many people in this city"': 'i-have-many-people-in-this-city.webp',
  'Acts|Paul Returns to Antioch': 'paul-returns-to-antioch.webp',
  'Acts|The Eloquent Apollos': 'the-eloquent-apollos.webp',
  'Acts|Baptism of the Holy Spirit': 'baptism-of-the-holy-spirit-pj.webp',
  'Acts|All of Asia Hears': 'all-of-asia-hears.webp',
  'Acts|Demons Defeated': 'demons-defeated.webp',
  'Acts|The Riot': 'the-riot.webp',
  'Acts|Paul in Macedonia': 'paul-in-macedonia.webp',
  'Acts|A Midnight Resurrection': 'a-midnight-resurrection.webp',
  "Acts|Paul's Goodbye to the Elders": 'pauls-goodbye-to-the-elders.webp',
  "Acts|Paul's Return to Jerusalem": 'pauls-return-to-jerusalem.webp',
  /* The rest of C2C Full's 50: one-off bespoke covers (own background/color per story, not
     a shared family like SOTM/Paul's Journeys above), finishing out every story in the set
     that didn't already have art. A few titles are also C2C Full members told from a
     different book (e.g. Mark's own "The Great Commission" and "Jesus Enters Jerusalem"
     exist too, but are not in this set) -- filenames get a -c2c suffix only where that
     collision exists, purely for legibility; lookup is by "Book|Title", not filename. */
  'Genesis|Noah and the Flood': 'noah-and-the-flood.webp',
  'Genesis|The Tower of Babel': 'the-tower-of-babel.webp',
  "Genesis|God's Promise to Abraham": 'gods-promise-to-abraham.webp',
  'Genesis|Abraham Sacrifices His Son': 'abraham-sacrifices-his-son.webp',
  'Genesis|Joseph': 'joseph.webp',
  'Exodus|Moses and the Burning Bush': 'moses-and-the-burning-bush.webp',
  'Exodus|The Plagues': 'the-plagues.webp',
  'Exodus|The Passover + Escape Through the Sea': 'the-passover-and-escape-through-the-sea.webp',
  'Exodus|The Golden Calf': 'the-golden-calf.webp',
  '1 Samuel|The Choosing of David': 'the-choosing-of-david.webp',
  '1 Samuel|David and Goliath': 'david-and-goliath.webp',
  '1 Kings|Elijah and the False Prophets': 'elijah-and-the-false-prophets.webp',
  'Jonah|Jonah and the Whale': 'jonah-and-the-whale.webp',
  'Daniel|The Gold Statue': 'the-gold-statue.webp',
  "Daniel|Daniel in the Lion's Den": 'daniel-in-the-lions-den.webp',
  'Matthew|Baptism of Jesus': 'baptism-of-jesus-c2c.webp',
  'Matthew|Temptation of Jesus': 'temptation-of-jesus-c2c.webp',
  'Matthew|Jesus in the Garden': 'jesus-in-the-garden.webp',
  'Matthew|The Great Commission': 'the-great-commission-c2c.webp',
  'Mark|The Sower': 'the-sower.webp',
  'Luke|The Rich Man and Lazarus': 'the-rich-man-and-lazarus.webp',
  'Luke|Jesus Enters Jerusalem': 'jesus-enters-jerusalem-c2c.webp',
  'Luke|The Last Supper': 'the-last-supper.webp',
  'John|The Lamb of God': 'the-lamb-of-god.webp',
  'John|Jesus and Nicodemus': 'jesus-and-nicodemus.webp',
  'Acts|Jesus Ascends to Heaven': 'the-holy-spirit-and-ascension.webp',
  'Acts|Pentecost': 'pentecost.webp',
  'Acts|The Early Church': 'the-early-church.webp',
  'Revelation|The Second Coming': 'the-second-coming.webp',
  'Revelation|The 1,000 Year Reign + Satan Crushed': 'the-thousand-year-reign-and-satan-crushed.webp',
  'Revelation|The New Creation': 'the-new-creation.webp',
  /* Not a C2C Full pass: these 18 finish out art for the OTHER six defined story sets (7
     Commands, Stories of Hope, Acts, OT Stories, Sacrifice Stories, Baptism Hammer), which
     each had a handful of members still showing the book-icon fallback. One-off bespoke
     covers, same as the rest of this map. */
  'Luke|Jesus Sends Out His Disciples': 'jesus-sends-out-his-disciples.webp',
  'Matthew|The Greatest Commandment': 'the-greatest-commandment.webp',
  'John|The Vine and the Branches': 'the-vine-and-the-branches.webp',
  'Luke|The Woman Who Wept at the Feet of Jesus': 'the-woman-who-wept-at-the-feet-of-jesus.webp',
  'Luke|The Pharisee and the Tax Collector': 'the-pharisee-and-the-tax-collector.webp',
  'Matthew|The Unforgiving Slave': 'the-unforgiving-slave.webp',
  'Luke|The Risen Jesus': 'the-risen-jesus.webp',
  'Acts|Healing a Lame Man': 'healing-a-lame-man.webp',
  'Acts|Before the Jewish Leadership': 'before-the-jewish-leadership.webp',
  'Acts|Stephen is Martyred': 'stephen-is-martyred.webp',
  "Acts|Paul's Conversion": 'pauls-conversion.webp',
  "Acts|Cornelius's Family is Saved": 'corneliuss-family-is-saved.webp',
  'Acts|The Church at Antioch Begins': 'the-church-at-antioch-begins.webp',
  'Judges|Gideon\'s Army': 'gideons-army.webp',
  '2 Samuel|David Sins': 'david-sins.webp',
  '2 Chronicles|Jehoshaphat': 'jehoshaphat.webp',
  'Genesis|Cain and Abel': 'cain-and-abel.webp',
  'Leviticus|Unintentional Sin': 'unintentional-sin.webp',
  /* Backlog batch 1 of 4 (see CLAUDE.md): the 20 remaining Old Testament stories, Genesis
     through the Exile, with no story set of their own driving priority -- just working
     through what's left. */
  'Genesis|Hagar and Ishmael': 'hagar-and-ishmael.webp',
  'Genesis|Sodom and Gomorrah': 'sodom-and-gomorrah.webp',
  'Genesis|Jacob and Esau': 'jacob-and-esau.webp',
  'Genesis|Jacob Wrestles with God': 'jacob-wrestles-with-god.webp',
  'Exodus|Manna': 'manna.webp',
  'Exodus|Hands Held High': 'hands-held-high.webp',
  "Exodus|Building God's Holy Tent": 'building-gods-holy-tent.webp',
  'Numbers|The 12 Spies': 'the-12-spies.webp',
  'Joshua|The Walls of Jericho': 'the-walls-of-jericho.webp',
  'Joshua|Achan Steals Some Treasure': 'achan-steals-some-treasure.webp',
  'Judges|Samson the Strong Man': 'samson-the-strong-man.webp',
  'Ruth|Ruth and Naomi': 'ruth-and-naomi.webp',
  "1 Samuel|Hannah's Prayer": 'hannahs-prayer.webp',
  '1 Kings|God Provides for Elijah': 'god-provides-for-elijah.webp',
  '2 Kings|Hezekiah is Healed': 'hezekiah-is-healed.webp',
  '2 Kings|Josiah, the boy King': 'josiah-the-boy-king.webp',
  'Nehemiah|Rebuilding the Wall (Nehemiah)': 'rebuilding-the-wall-nehemiah.webp',
  'Esther|Esther': 'esther.webp',
  'Job|Job': 'job.webp',
  "Ezekiel|A New Heart for God's People (The Exile)": 'a-new-heart-for-gods-people.webp',
  /* Backlog batch 3 of 4 (see CLAUDE.md): the remaining Matthew, Mark and John stories --
     everything left in those three Gospels once Parables (batch 2) are done separately.
     Luke, Acts and Revelation's remaining stories are batch 4, kept apart from these three
     since Luke-Acts is one continuous work by the same author and Revelation is the
     canon's own closing bookend. */
  'Matthew|Genealogy of Jesus': 'genealogy-of-jesus.webp',
  'Matthew|The Wise Men': 'the-wise-men.webp',
  'Matthew|John the Baptist': 'john-the-baptist.webp',
  'Matthew|Follow and Fish': 'follow-and-fish.webp',
  'Matthew|Jesus Walks on Water': 'jesus-walks-on-water.webp',
  'Matthew|Who did people say Jesus was?': 'who-did-people-say-jesus-was.webp',
  'Matthew|Jesus Shines in Glorious Light': 'jesus-shines-in-glorious-light.webp',
  'Matthew|Boy with an Unclean Spirit': 'boy-with-an-unclean-spirit.webp',
  'Matthew|Finding a Coin in the Mouth of a Fish': 'finding-a-coin-in-the-mouth-of-a-fish.webp',
  'Mark|The Man with the Paralyzed Hand': 'the-man-with-the-paralyzed-hand.webp',
  'Mark|True Relationships': 'true-relationships.webp',
  "Mark|A Gentile Mother's Faith": 'a-gentile-mothers-faith.webp',
  'John|Water Into Wine': 'water-into-wine.webp',
  'John|Cleansing the Temple': 'cleansing-the-temple.webp',
  "John|Healing an Official's Son": 'healing-an-officials-son.webp',
  'John|Man Healed After 38 Years': 'man-healed-after-38-years.webp',
  'John|An Adulteress Forgiven': 'an-adulteress-forgiven.webp',
  'John|The Good Shepherd': 'the-good-shepherd.webp',
  "John|Oil Poured on Jesus's Feet": 'oil-poured-on-jesuss-feet.webp',
  'John|Grain of Wheat': 'grain-of-wheat.webp',
  'John|Jesus Washes His Disciples Feet': 'jesus-washes-his-disciples-feet.webp',
  'John|The Way to the Father': 'the-way-to-the-father.webp',
  'John|The Promise of the Holy Spirit': 'the-promise-of-the-holy-spirit.webp',
  'John|Doubting Thomas': 'doubting-thomas.webp',
  /* Backlog batch 2 of 4 (see CLAUDE.md): the 21 remaining parables, all sharing a common
     "Kingdom of God" cover treatment (a consistent secondary background layer) so the set
     reads as a family even though -- unlike SOTM/Paul's Journeys above -- there's no
     dedicated story-set filter tying them together, just the shared Parables tag. The
     Unforgiving Slave above is also part of this family; its entry was left in place and
     only the file on disk was replaced. */
  'Matthew|The Weeds': 'the-weeds.webp',
  'Matthew|The Mustard Seed': 'the-mustard-seed.webp',
  'Matthew|The Hidden Treasure': 'the-hidden-treasure.webp',
  'Matthew|The Pearl of Great Price': 'the-pearl-of-great-price.webp',
  'Matthew|The Fishing Net': 'the-fishing-net.webp',
  'Matthew|The Vineyard Workers': 'the-vineyard-workers.webp',
  'Matthew|The Two Sons': 'the-two-sons.webp',
  'Matthew|The Vineyard Owner': 'the-vineyard-owner.webp',
  'Matthew|The Great Banquet': 'the-great-banquet.webp',
  'Matthew|The Ten Virgins': 'the-ten-virgins.webp',
  'Matthew|The Talents': 'the-talents.webp',
  'Matthew|The Sheep and the Goats': 'the-sheep-and-the-goats.webp',
  'Mark|The Growing Seed': 'the-growing-seed.webp',
  'Luke|The Good Samaritan': 'the-good-samaritan.webp',
  'Luke|The Rich Fool': 'the-rich-fool.webp',
  "Luke|Ready for the Master's Return": 'ready-for-the-masters-return.webp',
  'Luke|The Lost Sheep': 'the-lost-sheep.webp',
  'Luke|The Lost Coin': 'the-lost-coin.webp',
  'Luke|The Dishonest Manager': 'the-dishonest-manager.webp',
  'Luke|The Persistent Widow': 'the-persistent-widow.webp',
  'Luke|The Bags of Gold': 'the-bags-of-gold.webp',
  /* Backlog batch 4 of 4 (see CLAUDE.md): the remaining Luke, Acts and Revelation stories,
     the last of the four backlog batches. Luke|Jesus Ascends to Heaven (L68) gets a
     -luke suffix since Acts carries its own same-titled story (R4, see that story's own
     note above on the deliberate title collision); Acts's file keeps its older name
     (the-holy-spirit-and-ascension.webp) from before that story was renamed. */
  'Luke|The Annunciation': 'the-annunciation.webp',
  'Luke|The Shepherds and the Angels': 'the-shepherds-and-the-angels.webp',
  'Luke|Young Jesus': 'young-jesus.webp',
  'Luke|The Unclean Demonic Spirit': 'the-unclean-demonic-spirit.webp',
  'Luke|Miraculous Catch of Fish': 'miraculous-catch-of-fish.webp',
  'Luke|Cleansing a Leper': 'cleansing-a-leper.webp',
  'Luke|The Faith of a Roman Military Official': 'faith-of-a-roman-military-official.webp',
  "Luke|Widow's Son Raised": 'widows-son-raised.webp',
  'Luke|Take up Your Cross': 'take-up-your-cross.webp',
  'Luke|Mary and Martha': 'mary-and-martha.webp',
  'Luke|Healing a Disabled Woman': 'healing-a-disabled-woman.webp',
  'Luke|Counting the Cost': 'counting-the-cost.webp',
  'Luke|Ten Lepers Healed': 'ten-lepers-healed.webp',
  'Luke|Jesus and the Children': 'jesus-and-the-children.webp',
  'Luke|The Rich Young Ruler': 'the-rich-young-ruler.webp',
  'Luke|Blind Bartimaeus': 'blind-bartimaeus.webp',
  'Luke|Jesus Appears to Men on the Road': 'jesus-appears-to-men-on-the-road.webp',
  'Luke|Jesus Ascends to Heaven': 'jesus-ascends-to-heaven-luke.webp',
  'Acts|Lying to the Holy Spirit': 'lying-to-the-holy-spirit.webp',
  'Acts|A Growing Church': 'a-growing-church.webp',
  'Revelation|The Great White Throne Judgment': 'the-great-white-throne-judgment.webp',
};

/* Alternate titles. Search matches them, the editor exposes them, and a tile only shows
   one when the search hit it, so the extra name stays out of the way the rest of the time. */
const ALT_NAMES = {
  'Genesis|The First Sin': ['The Fall of Man'],
  'Luke|The Paralyzed Man': ['The Paralytic Man'],
  'Matthew|How To Pray': ["The Lord's Prayer"],
};

/* The 7 Commands set: ten commands, each a short phrase with the verse it comes from and the
   library story that illustrates it. Copied from Misc/Story-Sets.xlsx's "Stories By Set" tab
   (the "7 Commands" block: command in column D, its verse in E, story in F, the story's own
   reference in G), in the sheet's row order. Column G is what ties a row to a library story:
   the sheet's story names are looser than ours ("The Lord's Prayer" is How To Pray,
   Matthew 6:5-15; "Samaritan Woman" is The Samaritan Woman, John 4:1-42).
   One row needs a note: Endure Persecution's reference (Acts 5:12-42) spans two library
   stories, A Growing Church (5:12-16) and The Apostles Persecuted (5:17-42); the sheet's own
   title is the second one. (An earlier draft of the sheet had Pray and Forgive, Matthew 6:9,15,
   and a Love row naming a second story, "Love for Enemies", Luke 6:27-36, which is the Luke
   parallel of Love Your Enemies. Brett shortened the first to Pray and dropped the second on
   8 October 2026.)
   This list is the one source for both the set's order (SET_ORDER below is built from it) and
   the command line shown above each story while 7 Commands is the active set filter. */
const COMMANDS = [
  { n: 'Repent and Believe', r: 'Mark 1:15', ids: ['L57'] },
  { n: 'Be Baptized', r: 'Matthew 28:18-20', ids: ['R13'] },
  { n: 'Endure Persecution', r: 'Luke 9:23-24', ids: ['R11'] },
  { n: 'Pray', r: 'Matthew 6:9', ids: ['F21'] },
  { n: 'Go and Tell', r: 'Mark 16:15', ids: ['O8'] },
  { n: 'Love', r: 'Matthew 22:37-39', ids: ['L32'] },
  { n: 'Abide', r: 'John 15:4', ids: ['O23'] },
  { n: 'Gather', r: 'Hebrews 10:24-25', ids: ['R6'] },
  { n: 'Give', r: 'Matthew 6:1-4', ids: ['I35'] },
  { n: "Lord's Supper", r: 'Matthew 26:26-30', ids: ['L62'] },
];

/* A handful of story sets have a real intended sequence -- a set someone reads or tells
   start to finish, not just a bag of stories -- so List and Grid show them in this order
   instead of the library's default book order whenever exactly one of these sets is the
   active filter. Keyed by id, not "Book|Title": within one set, id is unique and stable
   even across a title edit, and it is what orderedForDisplay() looks up by.
   Creation to Christ comes straight from Misc/Story-Sets.xlsx's "Stories By Set" tab, an
   exact 1:1 match with that set's 13 members. C2C Full is the "Stories in Order" tab's own
   C2C Full? column, currently a 50-story sweep from Creation through the New Creation --
   listed here in that tab's own OT-then-Matthew-then-Mark-then-Luke-then-John-then-Acts-
   then-Revelation block order, not Creation to Christ's order, so the two arrays diverge
   past their shared first few ids on purpose. Expect this array to keep changing as Brett
   and Todd keep working through that column. 7 Commands and Stories of Hope both match
   their sheet blocks exactly, with no extra members and no judgment-call ordering. */
const SET_ORDER = {
  'Creation to Christ': ['B4', 'B6', 'F5', 'F33', 'I17', 'I18', 'I19', 'I21', 'O8', 'O14', 'L57', 'F69', 'F70'],
  /* C2C Full deliberately has NO entry here, unlike Creation to Christ above. That 13-story
     set is a hand-curated teaching sequence, reviewed 1:1 against the sheet's own "Stories
     By Set" tab, genuinely distinct from Bible order. C2C Full is not that: its whole point
     is "the Bible's own chronological sweep, Creation through New Creation," which is
     exactly what orderedForDisplay()'s fallback already computes -- canonical position via
     BASE_IDX, with the Gospels block re-sequenced by GOSPEL_ORDER below. An earlier version
     of this file gave C2C Full its own SET_ORDER array built from the "Stories in Order"
     tab's own row sequence (OT block, then all of Matthew, then all of Mark, ...); that is
     book-position order, not narrative chronology, so it sorted the Gospels portion by
     which book a story happened to be told from rather than what happened when -- the same
     bug GOSPEL_ORDER exists to fix everywhere else. Removing the entry, rather than trying
     to hand-fix that array, was the actual fix: falling through to the shared default gives
     C2C Full the real chronological order for free, with no separate array to keep in sync
     as more stories get tagged into the set. */
  /* The sheet's ten command rows, one story each, in the sheet's order, built from COMMANDS
     above. How To Pray is a Sermon on the Mount story, so it belongs to both sets: the sheet's
     Pray row names it. An earlier version of this set left it out, to keep the two sets apart,
     and carried three extras the sheet does not list (Jesus Sends Out His Disciples, the
     Greatest Commandment, the Great Commission); the set now follows the sheet. */
  '7 Commands': COMMANDS.flatMap(c => c.ids),
  /* The sheet's exact 8 rows, no judgment calls: Weeping Woman at Jesus' Feet, Pharisee &
     Tax Collector, Zacchaeus, Healing a Paralytic & Forgiving (Luke 5:17-26 -- the
     reference that made The Paralyzed Man's primary account Luke's rather than Matthew's,
     see STORY_IMG's note), The Unforgiving Slave, the Crucifixion, the Resurrection, the
     Prodigal Son. An earlier version of this array guessed at three different members for
     the gaps in a stale draft of the set; this is the corrected list. */
  'Stories of Hope': ['L23', 'L53', 'L57', 'F33', 'F52', 'F69', 'F70', 'L47'],
};

/* A harmonized chronological position for every story in the four Gospels, so Grid and
   List can show them in the order the events actually happened rather than in whichever
   Gospel the site's chosen "main" account happens to file them under -- the Death and
   Resurrection, told from Matthew, were sorting ahead of a Mark or Luke story that
   happened earlier in Jesus's ministry, purely because Matthew precedes Mark and Luke in
   the library's book order. Standard Gospel-harmony sequence (birth and childhood ->
   preparation -> early Judean ministry, John 1-4 -> Galilean ministry -> the road to
   Jerusalem, Luke's travel narrative interleaved with John's feast visits -> Passion week
   -> resurrection), checked section by section against A.T. Robertson's "A Harmony of the
   Gospels" and corrected once where it disagreed: the Centurion's Servant and the Widow of
   Nain's Son (Luke 7) belong after the Sermon on the Mount, not before it -- Luke's own
   text places them right after the Sermon on the Plain (Luke 6), alongside the Woman Who
   Wept at Jesus's Feet (Luke 7:36-50), which was already correctly ordered there. Spaced by
   10 so a newly added Gospel story can be slotted in without renumbering the rest; a
   tighter insertion can fall back to a decimal. Applies only inside the Gospels block's own
   position in the default order -- see orderedForDisplay. */
const GOSPEL_ORDER = {
  F4: 10, L4: 20, F5: 30, L6: 40, F6: 50, L7: 60, O4: 70, F7: 80, F8: 90, F9: 100,
  O5: 110, O6: 120, O7: 130, O8: 140, O9: 150, F10: 160, L12: 170, L11: 180, L13: 190, F33: 200,
  O10: 210, I11: 220, F11: 230, F12: 240, F13: 250, F14: 260, F15: 270, F16: 280, F17: 290, F18: 300,
  F19: 310, F20: 320, F21: 330, F22: 340, F23: 350, F24: 360, F25: 370, F26: 380, F27: 390, F28: 400,
  L21: 410, L22: 420, L23: 430, I12: 440, F39: 450, I13: 460, I15: 470, F40: 480, F41: 490, F42: 500,
  F43: 510, I17: 520, I18: 530, I19: 540, L31: 550, I21: 560, F45: 570, I23: 580, F47: 590, L30: 600,
  F48: 610, F49: 620, F50: 630, F52: 640, L32: 650, L33: 660, O13: 670, O14: 680, O15: 690, L36: 700,
  L39: 710, L40: 720, L43: 730, L45: 740, L46: 750, L47: 760, L48: 770, L50: 780, L51: 790, L52: 800,
  L53: 810, L54: 820, L55: 830, F56: 840, O16: 850, L56: 860, L57: 870, L58: 880, O17: 890, L59: 900,
  O19: 910, F59: 920, F60: 930, F61: 940, F62: 950, I35: 960, F64: 970, F65: 980, F66: 990, O20: 1000,
  L62: 1010, O21: 1020, O22: 1030, O23: 1040, F68: 1050, F69: 1060, F70: 1070, L66: 1080, L67: 1090, O27: 1100,
  F71: 1110, L68: 1120,
};

export const STORIES_CSS = `
/* ---- stories library ---- */
.lib{background:var(--paper);color:var(--ink);min-height:100vh}
.libhead{padding:clamp(26px,4vw,44px) 0 0}
.libhead h1{font-size:clamp(30px,5vw,46px);font-weight:680;letter-spacing:-.02em;line-height:1.1;margin:0}
.libcount{font-size:15px;color:var(--ink-s);margin-top:8px}
.libcount b{color:var(--teal);font-weight:700}

/* controls: three labelled groups, search / filter / view. Every control inside is 44px
   tall, so the row stays level however it wraps. */
.ctrls{display:flex;flex-wrap:wrap;gap:14px 28px;align-items:flex-start;margin:22px 0 0}
.cgrp{display:flex;flex-direction:column;gap:8px}
.cgrp.csearch{flex:1 1 260px;min-width:230px;max-width:440px}
.cgrp.cview{margin-left:auto}
.crow{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start}
/* Left aligned above its controls, on every width: a label sitting after its buttons reads
   backwards, and above keeps the buttons themselves flush left, which is the point. */
.eyebrow{display:flex;align-items:center;gap:9px;font-size:10.5px;font-weight:700;
  letter-spacing:.11em;text-transform:uppercase;color:var(--teal);min-height:19px}
/* .scount, not .cnum: the pitch page's .cnum is an absolutely positioned overlay label,
   which threw this count into the corner of the page. */
.eyebrow .scount{color:#8fa4b0;letter-spacing:.04em}
/* The clear control lives on the label, not in the button row, so a Languages button can
   join that row without the row growing a fourth thing to scan past. */
.cpill{display:inline-flex;align-items:center;gap:4px;font:inherit;font-size:9.5px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;color:var(--teal);background:#e7f5f8;
  border:1px solid #b6dee7;border-radius:20px;padding:3px 9px 3px 7px;cursor:pointer;line-height:1.4}
.cpill:hover{background:var(--teal);border-color:var(--teal);color:#fff}
.cpill[hidden]{display:none}
/* Stacked, the container's main axis is vertical, so csearch's flex-basis would become a
   260px tall search panel. Reset it. */
/* padding, not margin: #view has no border or padding of its own, so a margin here would
   simply collapse with the view's own 18-20px margin-top and change nothing. */
@media (max-width:820px){.ctrls{flex-direction:column;gap:15px}
  .cgrp{width:100%}.cgrp.csearch{flex:0 0 auto;max-width:none}.cgrp.cview{margin-left:0}
  #view{padding-top:12px}}
/* Between the stacked layout and the width where all three groups fit on one line, the view
   group used to wrap alone onto a second row. Instead, search takes the whole first row and
   filter + view share the second, view pushed right by its own auto margin. The upper bound
   is where search (260px basis) + filter + view + both gaps stops fitting the wrap, measured
   with the Clear pill showing (it widens the filter group by 28px, and the page opens with a
   filter on), so the layout does not jump when that pill appears or goes away. */
@media (min-width:821px) and (max-width:1110px){.cgrp.csearch{flex:1 1 100%;max-width:none}}
.srch{position:relative;width:100%;height:44px}
.srch input{width:100%;height:44px;font:inherit;font-size:15px;padding:0 14px 0 38px;border-radius:10px;
  border:1px solid #d5dee2;background:#fff;color:var(--ink)}
.srch input:focus{outline:2px solid var(--teal);outline-offset:-1px;border-color:transparent}
.srch svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8fa4b0}
/* margin:0 is load bearing. The pitch page's own .fbtn carries margin-bottom:10px, which
   otherwise makes the filter row 10px taller than the view row sitting beside it. */
.fbtn{display:inline-flex;align-items:center;gap:8px;height:44px;margin:0;font:inherit;font-size:14px;
  font-weight:600;padding:0 15px;border-radius:10px;border:1px solid #d5dee2;background:#fff;
  color:var(--ink);cursor:pointer}
.fbtn:hover{border-color:#9fb3bd;background:#f4f9fa}
.fbtn.on{background:var(--navy);border-color:var(--navy);color:#fff}
.fbtn.on:hover{background:#25455f}
.fbtn .n{background:var(--teal);color:#fff;border-radius:20px;font-size:11.5px;font-weight:700;padding:1px 7px}
.fbtn[hidden]{display:none}
.fbtn.clr{color:var(--teal);border-color:#bcdde5}
.fbtn.clr:hover{background:#eaf6f9;border-color:var(--teal)}
.views{display:inline-flex;height:44px;border:1px solid #d5dee2;border-radius:10px;overflow:hidden;background:#fff}
.views button{font:inherit;font-size:13.5px;font-weight:600;padding:0 14px;border:0;background:none;
  color:var(--ink-s);cursor:pointer;display:inline-flex;align-items:center;gap:7px}
.views button:hover{background:#f4f9fa;color:var(--ink)}
.views button+button{border-left:1px solid #e3eaed}
.views button.on,.views button.on:hover{background:var(--navy);color:#fff}

/* filter drawers */
.drawer{display:none;background:#fff;border:1px solid #e0e7ea;border-radius:12px;padding:16px 18px;margin-top:12px}
.drawer.open{display:block}
.dgrp+.dgrp{margin-top:14px;padding-top:14px;border-top:1px solid #eef2f4}
/* The Tags drawer has six stacked groups, so it gets roomier spacing and a slightly firmer rule
   than the editor modal, which shares .dgrp and stays compact. */
#dTags .dgrp+.dgrp{margin-top:24px;padding-top:24px;border-top-color:#dde6ea}
#dTags .dgrp h4{margin-bottom:14px}
.dgrp h4{font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--teal);margin:0 0 9px}
/* .fchips, not .chips: the pitch page's shared CSS styles ".chips span" as a pink pill */
.fchips{display:flex;flex-wrap:wrap;justify-content:flex-start;gap:8px}
.fchips.g4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}
@media (max-width:900px){.fchips.g4{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:640px){.fchips.g4{grid-template-columns:repeat(2,minmax(0,1fr))}}
.chip{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;padding:8px 12px;
  border-radius:20px;border:1px solid #d9e1e5;background:#fff;color:var(--ink);cursor:pointer;line-height:1.3;
  text-align:left;font-family:inherit;transition:background .13s,border-color .13s,color .13s}
.chip:hover{background:#eef7f9;border-color:#9fd2de}
.chip img{width:18px;height:18px;border-radius:5px;object-fit:cover;flex:none}
.chip.on{background:var(--teal);border-color:var(--teal);color:#fff}
.chip.on:hover{background:#178ca4;border-color:#178ca4}
.fchips.g4 .chip{justify-content:flex-start}
/* Story Sets drawer on a phone. Two columns left each chip about 150px wide, so longer names
   wrapped to two lines while short ones stayed on one, and there was no room to enlarge the
   icon. Below 560px it is one column instead: every name fits on one line and the icon can
   grow. Scoped to #dSets so the story editor's own set chips (same markup) are untouched. */
@media (max-width:640px){#dSets .fchips.g4 .chip img{width:32px;height:32px;border-radius:8px}}
@media (max-width:560px){
  #dSets .fchips.g4{grid-template-columns:minmax(0,1fr)}
  #dSets .fchips.g4 .chip{min-height:56px;padding:8px 16px 8px 12px;gap:12px;font-size:15px}
  #dSets .fchips.g4 .chip img{width:40px;height:40px;border-radius:10px}
  #dSets .chip .cnt{font-size:13px}}
.chip .cnt{margin-left:auto;padding-left:6px;background:none;border:0;font-size:12px;font-weight:700;
  font-variant-numeric:tabular-nums;color:var(--teal)}
.chip:hover .cnt{color:#127e94}
.chip.on .cnt{color:#fff}
.dnote{font-size:12px;color:#8fa4b0;margin:10px 0 0}
/* A switch, not a chip. Everything else in this drawer is a filter you pick from a set;
   this is one persistent on/off that changes the whole page, and it should not look like
   another tag. .swt rather than .tog: the pitch page already owns that name. */
/* Switch first, then the label: stretched across a 1180px drawer, a trailing switch ends
   up an inch from the words it belongs to. */
.swrow{display:inline-flex;align-items:center;gap:11px;background:none;border:0;padding:2px 0;
  font:inherit;color:var(--ink);cursor:pointer;text-align:left}
/* Two switches sharing a line rather than each taking its own -- wraps on a narrow drawer. */
.swrowset{display:flex;flex-wrap:wrap;column-gap:28px;row-gap:8px}
.swlbl{display:inline-flex;align-items:center;gap:9px;font-size:14px;font-weight:600}
.swlbl svg{color:#9fb3bd;fill:none}
.swrow[aria-checked="true"] .swlbl svg{color:var(--teal)}
/* The tag glyph reads better solid than outlined once it is "on"; its dot is hard-coded
   filled already, so it has to flip to white or it disappears into the now-solid tag. Scoped
   to .tagwrap rather than every swrow icon, since the same trick would turn the image icon
   into a solid teal square. */
.swrow[aria-checked="true"] .tagwrap svg{fill:currentColor}
.swrow[aria-checked="true"] .tagwrap svg circle{fill:#fff}
.swt{position:relative;flex:none;width:40px;height:23px;border-radius:99px;background:#d3dade;
  transition:background .16s}
.swt:after{content:"";position:absolute;top:2.5px;left:2.5px;width:18px;height:18px;border-radius:50%;
  background:#fff;box-shadow:0 1px 2px rgba(28,49,68,.28);transition:transform .16s}
.swrow:hover .swt{background:#c3ccd2}
.swrow[aria-checked="true"] .swt{background:var(--teal)}
.swrow[aria-checked="true"]:hover .swt{background:#178ca4}
.swrow[aria-checked="true"] .swt:after{transform:translateX(17px)}
/* Parallel passages only exist in the Gospels, so the control rides on that group's own
   header rather than taking a line in the controls bar. Sticky right, because the Gospels
   bar is about 900px wide and its right end scrolls out of view otherwise. */
.dupsw{position:sticky;right:11px;margin-left:auto;display:inline-flex;align-items:center;gap:6px;
  padding:4px 10px 4px 8px;border-radius:99px;font-size:11.5px;font-weight:600;letter-spacing:0;
  text-transform:none;background:rgba(255,255,255,.17);color:#fff;cursor:pointer;white-space:nowrap}
.dupsw:hover{background:rgba(255,255,255,.3)}
.dupsw[aria-checked="true"]{background:#fff;color:var(--teal)}
.tgroup.shut .dupsw{display:none}
/* Same pill language for bulk expand/collapse on a testament bar in the stacked view.
   Not sticky like .dupsw: a .vhead never scrolls, it is already exactly as wide as its
   button, so there is no edge for the pill to run off. */
.expsw{margin-left:auto;display:inline-flex;align-items:center;gap:6px;padding:4px 10px 4px 8px;
  border-radius:99px;font-size:11.5px;font-weight:600;letter-spacing:0;text-transform:none;
  background:rgba(255,255,255,.17);color:#fff;cursor:pointer;white-space:nowrap}
.expsw:hover{background:rgba(255,255,255,.3)}
.vtest.shut .expsw{display:none}
.clearall{font:inherit;font-size:13px;font-weight:600;color:var(--teal);background:none;border:0;cursor:pointer;padding:6px 2px}

/* tiles. .tile is a <button>, and a button taller than its content centres that content
   vertically, which knocked the grid view's images out of line. Flex column pins them up.
   Books and grid follow the mobile list row: set icons ride inline after the title like
   emoji, and the tag row is behind the button in the bottom right corner. */
.tile{background:#fff;border:1px solid #e2e8ea;border-radius:12px;padding:11px;position:relative;
  display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;
  text-align:left;width:100%;font:inherit;color:inherit;cursor:pointer}
.tile:hover{border-color:#9fb3bd;box-shadow:0 2px 10px rgba(28,49,68,.07)}
.tmain{min-width:0}
.tinline{display:inline-flex;gap:3px;vertical-align:-3px;margin-left:5px}
.tinline img{width:15px;height:15px;border-radius:4px;object-fit:cover}

.tph{aspect-ratio:16/10;flex:none;border-radius:8px;overflow:hidden;background:linear-gradient(135deg,#e8eef1,#dbe5ea);
  display:flex;align-items:center;justify-content:center;color:#a8bcc7;margin-bottom:9px}
.tph img{width:100%;height:100%;object-fit:cover;display:block}
/* Compact variant for the book columns, where a full-width image would make a 13-story
   column about 1800px tall. Image and set icons stack in the left rail; title, reference
   and tags run down the right. The grid view keeps the large card. */
.tile.cmp{display:grid;grid-template-columns:46px minmax(0,1fr);gap:8px 10px;padding:9px;align-items:start}
.tile.cmp .tph{aspect-ratio:1;width:46px;height:46px;margin:0}
.tile.cmp .tph svg{width:18px;height:18px}
.tile.cmp .tmain{grid-column:2}
.tile.cmp .ttags,.tile.cmp .tctx{grid-column:1/-1;margin-top:0}
.tile.cmp .tr{margin-top:2px}
.tt{font-size:14px;font-weight:700;letter-spacing:-.01em;line-height:1.25}
.tr{font-size:12px;color:var(--ink-s);margin-top:3px;font-variant-numeric:tabular-nums}
/* Command line above a title while 7 Commands is the active set: teal name, gray verse. */
.tcmd{display:block;font-size:11.5px;font-weight:700;line-height:1.3;color:var(--teal);margin-bottom:3px}
.tcmd .tcn{white-space:nowrap}
.tcmd .tcr{font-weight:500;color:#7E8F99;white-space:nowrap}
.tcmd.stk .tcn,.tcmd.stk .tcr{display:block}
.tsets{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}
.tsets img{width:20px;height:20px;border-radius:5px;object-fit:cover}
/* Two rows of tags, then clip. 19px row + 4px gap, so the cut never lands mid-row.
   Hidden until the tag button is on, or a tag filter is active. */
.ttags{display:none;flex-wrap:wrap;gap:4px;margin-top:7px;max-height:42px;overflow:hidden}
.showtags .ttags{display:flex}
.ttag{font-size:10.5px;font-weight:600;background:#eef3f5;color:#5E727C;border-radius:5px;padding:2px 6px;white-space:nowrap}
.ttag.on{background:var(--teal);color:#fff}
/* Distinct from .on: a search landed on this tag's name, it is not filtering by it. */
.ttag.hit{background:#cdeef5;color:var(--ink)}
.talt{display:block;font-size:11.5px;color:#7E8F99;margin-top:2px;font-style:italic}
.tctx{font-size:11.5px;line-height:1.45;color:#5E727C;margin-top:7px;padding-left:8px;border-left:2px solid #cfe6ec}
mark{background:#cdeef5;color:var(--ink);border-radius:3px;padding:0 2px}
/* Sermon on the Mount and Paul's Journeys used to get a tinted tile outline here (maroon
   and navy, matching each set's own icon) so a tile read as "belongs to that set" at a
   glance. Dropped once both sets got their own consistent cover-art backdrop and palette
   (see STORY_IMG's note above the SOTM/Paul's Journeys entries) -- the art now carries
   that signal, so the extra border was redundant. The list row still shows the words. */
.som{background:#e3f4f8;color:var(--teal);font-size:9.5px;font-weight:700;letter-spacing:.04em;
  border-radius:4px;padding:2px 5px;white-space:nowrap}

/* books view: one rail, 66 book columns, two levels of collapsible grouping.
   The rail runs to the right edge of the window rather than stopping at the 1180px wrap,
   so it reads as content continuing off the page rather than a box that happens to
   scroll. --vw is the document's client width, set by script: plain 100vw includes the
   vertical scrollbar and would overshoot by its width. */
.booksout{margin-top:20px;margin-right:calc(50% - var(--vw,100vw) / 2)}
/* The scrollbar sits above the group headers, where it is visible without scrolling to
   the bottom of a very tall rail. The thumb is drawn here rather than being a real
   scrollbar on a proxy element: a native bar is positioned by the platform, and on macOS
   it renders as an overlay pinned to the bottom edge of its box no matter what
   ::-webkit-scrollbar says, which left the thumb sitting under the line instead of on it.
   Drawing it means the thumb is centred on the line on every platform. */
.btop{position:relative;height:16px;margin-bottom:12px;cursor:pointer;touch-action:none}
.btop[hidden]{display:none}
.btop:before{content:"";position:absolute;left:0;right:0;top:50%;margin-top:-.5px;height:1px;background:#d5dfe4}
.bthumb{position:absolute;top:50%;left:0;margin-top:-3.5px;height:7px;min-width:36px;
  border-radius:99px;background:#9fb3bd}
.btop:hover .bthumb,.bthumb.drag{background:#7e96a3}
.books{overflow-x:auto;padding-bottom:22px;scrollbar-width:none}
.books::-webkit-scrollbar{display:none}
.brail{display:flex;align-items:flex-start;gap:18px;width:max-content;padding:2px 26px 0 0}
.btest{display:flex;flex-direction:column;align-items:stretch;gap:9px}
.tgrps{display:flex;align-items:flex-start;gap:14px}
.tgroup{display:flex;flex-direction:column;align-items:stretch;gap:7px}
.thead{display:flex;align-items:center;font-family:inherit;font-size:12px;font-weight:700;
  letter-spacing:.09em;text-transform:uppercase;border:0;border-radius:9px;padding:0 13px;height:36px;
  cursor:pointer;white-space:nowrap}
/* The rail is ~10,000px wide, so a label sitting at the far left of its group would scroll
   out of sight almost immediately. Pin it to the left edge of the scrollport instead. */
.thead .hin{position:sticky;left:13px;display:inline-flex;align-items:center;gap:8px}
.thead .gn{opacity:.62;letter-spacing:0;text-transform:none;font-weight:600;font-size:11.5px}
.thead.t1{background:var(--navy);color:#fff}
.thead.t1:hover{background:#27465f}
.thead.t2{background:var(--teal);color:#fff}
.thead.t2:hover{background:#178ca4}
/* The whole bar toggles; this is just the affordance that says so. */
.thead .gtog{display:inline-flex;align-items:center;margin-right:1px;opacity:.72}
.thead:hover .gtog{opacity:1}
.btest.shut .tgrps,.tgroup.shut .brow{display:none}
/* Collapsed, a group turns into a narrow vertical spine, Glide style */
.btest.shut>.thead,.tgroup.shut>.thead{writing-mode:vertical-rl;height:250px;width:36px;padding:13px 0;justify-content:flex-start}
.btest.shut>.thead .hin,.tgroup.shut>.thead .hin{position:static}
.tgroup.shut>.thead{height:216px;width:34px}
.brow{display:flex;gap:12px;align-items:flex-start}
.bcol{flex:0 0 212px;min-width:212px}
.bcol.empty{flex:0 0 96px;min-width:96px;opacity:.42}
.bname{font-size:13px;font-weight:700;letter-spacing:-.01em;padding:7px 9px;border-radius:8px;
  background:var(--navy);color:#fff;display:flex;gap:9px;align-items:baseline}
.bcol.empty .bname{background:#dfe7ea;color:#7E8F99}
/* Beside the name, the way a group header carries its count. */
.bname .bn{font-size:11px;font-weight:600;opacity:.62}
/* No tray behind the tiles: at 212px a column has no width to spare. A hairline runs down
   the middle of the column instead, and the tiles sit on top of it. */
.bstack{position:relative;display:flex;flex-direction:column;gap:14px;padding:10px 0 0;min-height:20px}
.bstack:not(:empty):before{content:"";position:absolute;left:50%;top:0;bottom:0;width:1px;
  margin-left:-.5px;background:#d3dee3}
.bstack>*{position:relative}
.dup{background:#f4f7f8;border-style:dashed;cursor:default;padding:9px}
.dup:hover{box-shadow:none;border-color:#d7e0e4}
.dup .tt{font-weight:600;color:#7E8F99}
.dupof{font-size:10.5px;color:#93a7b2;margin-top:3px}

/* stacked books view: an outline you can open, rather than a wall you have to scroll.
   Sections stay horizontal headings whether open or shut; the vertical spine in the
   side-by-side view exists because a shut group there has to fit in a narrow column, and
   that reason does not apply to a full width bar. */
.vbooksv{margin-top:20px}
.vtest{margin-bottom:16px}
/* Capped at the same 440px as .csearch: full width made these bars read as a single huge
   slab of colour with the label lost at the left edge. A short heading-sized bar over the
   full width story rows below it reads more like a table of contents entry. */
.vhead{display:flex;align-items:center;gap:9px;width:100%;max-width:440px;font-family:inherit;
  font-size:12px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;border:0;
  border-radius:9px;padding:0 13px;height:38px;cursor:pointer;text-align:left}
.vhead .gn{opacity:.62;letter-spacing:0;text-transform:none;font-weight:600;font-size:11.5px}
.vhead .gtog{display:inline-flex;align-items:center;opacity:.72}
.vhead:hover .gtog{opacity:1}
.vhead.v1{background:var(--navy);color:#fff}
.vhead.v1:hover{background:#27465f}
/* Indented 20px on the left by .vgroup's margin, so it is 20px narrower on the right too:
   without this it would run 20px past the testament bar and the search bar above it. */
.vhead.v2{background:var(--teal);color:#fff;height:34px;margin-top:9px;max-width:420px}
.vhead.v2:hover{background:#178ca4}
.vtest.shut .vgroup,.vgroup.shut .vbooks{display:none}
/* Indented under the testament bar above it, so the nesting is visible even though both
   are full width bars rather than a literal tree. */
.vgroup{margin-left:20px}
@media (max-width:640px){.vgroup{margin-left:12px}}
/* One scroller per section with the book name frozen at the left, so every book's stories
   line up. No visible scrollbar: a story tile cut off at the right edge is itself the cue
   that there is more to scroll to, and a bar here would be one of nine on screen at once
   whenever every section is open. */
.vbooks{overflow-x:auto;margin-top:9px;scrollbar-width:none}
.vbooks::-webkit-scrollbar{display:none}
.vbook{display:flex;align-items:stretch;width:max-content;min-width:100%}
.vbname{position:sticky;left:0;z-index:2;flex:0 0 156px;display:flex;align-items:center;gap:8px;
  background:var(--paper);padding:12px 14px 12px 2px;font-size:13.5px;font-weight:700;letter-spacing:-.01em}
.vbname .bn{font-size:11px;font-weight:600;color:#93a7b2}
.vbook.empty{opacity:.45}
.vbook.empty .vbname{font-weight:600}
.vrow{position:relative;display:flex;gap:14px;align-items:center;padding:11px 26px 11px 0}
.vrow:not(:empty):before{content:"";position:absolute;left:-14px;right:20px;top:50%;height:1px;background:#d3dee3}
.vrow>*{position:relative;flex:0 0 212px;width:212px}
@media (max-width:640px){.vbname{flex-basis:118px;font-size:12.5px}}

/* list view. Desktop is a six column table; below 860px the same markup is re-laid-out as
   a compact card, so there is only one row of HTML to keep in step. */
.listv{margin-top:18px;background:#fff;border:1px solid #e2e8ea;border-radius:12px;overflow:hidden}
.lrow{display:grid;grid-template-columns:34px 52px 1.6fr 1fr 70px 1.1fr 1.4fr;gap:14px;align-items:center;
  padding:10px 14px;border-bottom:1px solid #eef2f4;width:100%;background:none;border-left:0;border-right:0;
  border-top:0;font:inherit;text-align:left;color:inherit;cursor:pointer;position:relative}
.lrow:last-child{border-bottom:0}
.lrow:hover{background:#f7fafb}
.lrow.h{background:#f4f8f9;font-size:11.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
  color:#7E8F99;cursor:default;position:sticky;top:0;z-index:2}
.lrow.h:hover{background:#f4f8f9}
.lnum{font-size:11.5px;font-weight:600;color:var(--teal);font-variant-numeric:tabular-nums}
.lrow.h .lnum{color:inherit;font-size:inherit;font-weight:inherit}
.lt2{font-size:14px;font-weight:700;letter-spacing:-.01em}
.lref{font-size:12.5px;color:var(--ink-s);font-variant-numeric:tabular-nums}
/* The Crafted column is the library's checklist: a green check once a story has reviewed
   English text, blank until then. */
.lcr{text-align:center;font-size:17px;line-height:1}
.lrow.h .lcr{font-size:inherit}
.lph{aspect-ratio:1;width:52px;border-radius:7px;overflow:hidden;background:linear-gradient(135deg,#e8eef1,#dbe5ea);
  display:flex;align-items:center;justify-content:center;color:#a8bcc7}
.lph img{width:100%;height:100%;object-fit:cover;display:block}
.lph svg{width:16px;height:16px}
/* Inline set icons are the mobile card's business only. */
.lsets{display:none}
.lrow .ttags{display:flex}
.ltags{display:flex;flex-wrap:wrap;gap:4px}
.lrow .tctx{grid-column:1/-1;margin-top:2px}

@media (max-width:860px){
  .lrow{grid-template-columns:52px minmax(0,1fr) auto;gap:4px 11px;align-items:start;padding:11px 13px}
  .lrow.h{display:none}
  .lph{grid-column:1;grid-row:1/span 2;align-self:start}
  .lt2{grid-column:2;grid-row:1}
  .lnum{grid-column:3;grid-row:1;justify-self:end;padding-top:2px}
  .lref{grid-column:2;grid-row:2}
  .lcr{grid-column:3;grid-row:2;justify-self:end;align-self:start}
  .lsetcol{display:none}
  .lsets{display:inline-flex;gap:3px;vertical-align:-3px;margin-left:5px}
  .lsets img{width:15px;height:15px;border-radius:4px;object-fit:cover}
  .lrow .ltags{grid-column:1/-1;grid-row:3;margin-top:7px;display:none}
  .showtags .lrow .ltags{display:flex}
  .lrow .tctx{grid-row:4}
}

/* grid view. auto-fill rather than a ladder of fixed column counts: the tile has an ideal
   width of about 175px, and letting the row fill gives 6 at the 1180px wrap and then 5, 4,
   3, 2 on the way down, with no width where the tiles balloon to fill a missing column. */
.gridv{margin-top:18px;display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:14px}
.gridv .tph{aspect-ratio:1}
/* Below about 405px auto-fill would drop to one column, which wastes most of a phone
   screen on a square image. Hold it at two. */
@media (max-width:440px){.gridv{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .gridv .tile{padding:9px}}

.none{padding:44px 0;text-align:center;color:var(--ink-s);font-size:15px}

/* Story detail. It takes the page over from the list while a story is open (see showDetail),
   so the filters, view and scroll position are exactly as they were when you come back.
   Classes are sdv-prefixed because the shared stylesheet restyles bare h2 and a few other
   generic selectors, and .sd already names something on the pitch page. */
.lib.detailing .libhead,.lib.detailing .ctrls,.lib.detailing .drawer,.lib.detailing #view{display:none}
#detail{display:none}
.lib.detailing #detail{display:block}
.sdvwrap{max-width:800px;margin:0 auto;padding:6px 0 48px}
.sdvtop{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:28px;align-items:start}
.sdvback{display:inline-flex;align-items:center;gap:7px;font:inherit;font-size:16px;font-weight:500;color:var(--teal);
  background:none;border:0;padding:10px 0;margin:10px 0 8px;cursor:pointer}
.sdvback:hover{text-decoration:underline}
.sdvcover{border-radius:10px;overflow:hidden;aspect-ratio:1;background:linear-gradient(135deg,#e8eef1,#dbe5ea);
  box-shadow:0 1px 3px rgba(0,0,0,.1);display:flex;align-items:center;justify-content:center;color:#a9bbc5}
.sdvcover img{width:100%;height:100%;object-fit:cover;display:block}
.sdvcover svg{width:34px;height:34px}
.sdvhead{margin-top:0}
.sdvhead .sdvlbl{font-size:10.5px;font-weight:700;letter-spacing:.11em;text-transform:uppercase;color:var(--teal);margin:20px 0 8px}
.sdvhead .sdvchips{display:flex;flex-wrap:wrap;gap:8px}
.sdvhead .tcmd{font-size:14px;margin:0 0 6px}
.sdvhead h1{font-size:clamp(28px,6vw,36px);font-weight:700;letter-spacing:-.01em;line-height:1.15;margin:0;color:var(--ink);max-width:none;text-align:left}
.sdvhead h1:focus{outline:none}
.sdvmeta{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-top:10px}
.sdvref{font-size:17px;color:var(--ink-s)}
.sdvalso{font-size:14px;color:#7E8F99;margin-top:6px;line-height:1.45}
.sdvpill{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;padding:4px 11px;border-radius:20px;
  background:#eef2f4;color:#6b7f8b}
.sdvpill.ok{background:#e4f6ea;color:#1d6b3a}
.sdvc{background:#fff;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,.1),0 1px 2px -1px rgba(0,0,0,.1);padding:16px;margin-top:24px}
.sdvc.read{padding:20px 20px 12px}
.sdvlab{font-size:14px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--teal);margin:0 0 12px;
  line-height:1.3;max-width:none;text-align:left}
.sdvlab small{font-size:12px;font-weight:500;letter-spacing:0;text-transform:none;color:#7E8F99;margin-left:8px}
.sdvlabout{margin:32px 0 12px;padding:0}
.sdvlisthead{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.sdvlisthead .sdvlab{margin:0}
.sdvdlbtn{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:rgba(26,157,184,.12);color:var(--teal)}
.sdvdlbtn:hover{background:rgba(26,157,184,.22)}
.sdvdlbtn svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.sdvplay{display:flex;align-items:center;gap:16px}
.sdvpp{width:56px;height:56px;border-radius:50%;border:0;background:#0D2D3D;color:#fff;flex:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;padding:0;transition:background .15s}
.sdvpp:hover{background:#1c4a61}
.sdvpp svg.sdvi1,.sdvpp svg.sdvi2{width:22px;height:22px;min-width:22px;fill:#fff;stroke:none;display:block}
.sdvplay .sdvpp svg.sdvi2{display:none}
.sdvplay.playing .sdvpp svg.sdvi1{display:none}
.sdvplay.playing .sdvpp svg.sdvi2{display:block}
.sdvpp:disabled{background:#c9d5db;cursor:default}
.sdvtrk{flex:1;min-width:0;position:relative;height:56px;display:flex;align-items:center}
.sdvseek{-webkit-appearance:none;appearance:none;display:block;width:100%;height:6px;margin:0;border-radius:3px;cursor:pointer;
  background:linear-gradient(to right,var(--teal) var(--p,0%),#dbe4e8 var(--p,0%));outline-offset:8px}
.sdvseek::-webkit-slider-runnable-track{height:6px;background:transparent}
.sdvseek::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:var(--teal);
  border:0;box-shadow:0 1px 3px rgba(0,0,0,.3);margin-top:-7px}
.sdvseek::-moz-range-track{height:6px;background:transparent}
.sdvseek::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:var(--teal);border:0;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.sdvseek:disabled{cursor:default;background:#dbe4e8}
.sdvseek:disabled::-webkit-slider-thumb{background:#c9d5db;box-shadow:none}
.sdvseek:disabled::-moz-range-thumb{background:#c9d5db;box-shadow:none}
.sdvtimes{position:absolute;left:0;right:0;top:calc(50% + 13px);display:flex;justify-content:space-between;line-height:1.2;font-size:13px;color:#7E8F99;font-variant-numeric:tabular-nums}
.sdvplay.off .sdvtimes{color:#a9bbc5}
.sdvnote{font-size:14px;color:var(--ink-s);margin:12px 0 0;line-height:1.5}
.sdvnote a,.sdvlink{color:var(--teal);font-weight:600;text-decoration:none}
.sdvnote a:hover,.sdvlink:hover{text-decoration:underline}
.sdvboard img{width:100%;display:block;border-radius:6px}
.sdvboard .sdvlisthead{margin-bottom:12px}
.sdvtext{font-size:19px;line-height:1.7;color:rgba(28,49,68,.92)}
.sdvtext p{margin:0 0 1em;color:inherit;max-width:none;font-size:inherit;line-height:inherit}
.sdvtext .sdvpass{font-size:16px;font-weight:700;color:var(--ink);margin:1.2em 0 .4em;letter-spacing:0;text-transform:none;line-height:1.3;max-width:none;text-align:left}
.sdvtext .sdvpass:first-child{margin-top:0}
.sdvbsb p{white-space:pre-line}
.sdvn{font-size:.62em;font-weight:700;color:var(--teal);margin-right:.25em;vertical-align:super;line-height:0;user-select:none}
.sdvclamp{max-height:7.5rem;overflow:hidden;position:relative}
.sdvclamp.open{max-height:none}
.sdvfade{position:relative;margin-top:-4rem;height:4rem;background:linear-gradient(rgba(255,255,255,0),#fff);pointer-events:none}
.sdvfade.gone{display:none}
.sdvmorewrap{display:flex;justify-content:center;padding:8px 0 4px}
.sdvmore{font:inherit;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--teal);
  background:#e0f7fc;border:0;border-radius:20px;padding:6px 16px;cursor:pointer}
.sdvmore:hover{background:#cdf0f8}
.sdvmorewrap[hidden]{display:none}
.sdvdet{margin-top:14px;border-top:1px solid #e6edef;padding-top:12px}
.sdvdet summary{cursor:pointer;color:var(--teal);font-weight:600;font-size:14px}
.sdvdet .sdvtext{margin-top:12px;font-size:17px}
.sdvdl .sdvdet{border-top:0;padding-top:0;margin-top:8px}
.sdvchips{display:flex;flex-wrap:wrap;gap:8px}
.sdvdl{display:grid;grid-template-columns:140px minmax(0,1fr);gap:12px 18px;font-size:15px;margin:0;line-height:1.5}
.sdvdl dt{color:#7E8F99;font-weight:600}
.sdvdl dd{margin:0;color:var(--ink)}
.sdvlangs{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.sdvlang{font-size:12px;padding:3px 9px;border-radius:12px;background:#f1f4f6;color:#8fa4b0}
.sdvlang.on{background:#e4f6ea;color:#1d6b3a;font-weight:700}
.sdvnav{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24px;margin-top:32px}
.sdvnb.next{grid-column:2}
.sdvnb{min-width:0;display:flex;align-items:center;gap:12px;text-align:left;font:inherit;background:#fff;
  border:0;box-shadow:0 1px 3px rgba(0,0,0,.1);border-radius:10px;padding:10px 12px;color:var(--ink);cursor:pointer}
.sdvnb:hover{box-shadow:0 2px 8px rgba(0,0,0,.14)}
.sdvnb .sdvnt{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.sdvnb.next .sdvnt{text-align:right;align-items:flex-end}
.sdvnb .sdvnth{width:56px;height:56px;border-radius:8px;overflow:hidden;flex:none;background:#e3eaee;display:flex;align-items:center;justify-content:center;color:#a9bbc5}
.sdvnb .sdvnth img{width:100%;height:100%;object-fit:cover;display:block}
.sdvnb .sdvnth svg{width:22px;height:22px}
.sdvnb .sdvchev{width:22px;height:22px;flex:none;fill:none;stroke:var(--teal);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
.sdvnb.prev .sdvchev{transform:scaleX(-1)}
.sdvnb small{font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:#7E8F99;font-weight:700}
.sdvnb b{font-size:14.5px;font-weight:700;line-height:1.3;max-width:100%}
.sdvnb[hidden]{display:none}
@media (max-width:720px){
  .sdvtop{grid-template-columns:1fr;gap:24px}
  .sdvnav{grid-template-columns:minmax(0,1fr);gap:12px}
  .sdvnb.next{grid-column:1}
  .sdvdl{grid-template-columns:1fr;gap:2px}
  .sdvdl dd{margin-bottom:12px}
  .sdvtext{font-size:18px}
}
`;

export function storiesPage({ CSS, LOGO, LOGOSQ, OG_URL, NAV, data, text, langNames, ic, ap }) {
  const counted = data.stories.filter(s => !s.som).length;
  const withSom = data.stories.length;
  /* Fail the build on a stale key rather than shipping a silently pictureless or
     unsearchable story. STORY_IMG and ALT_NAMES are keyed "Book|Title"; the crafted-text map
     and each story's detail file are keyed by its slug. */
  const known = new Set(data.stories.map(s => s.b + '|' + s.t));
  const slugs = new Set(data.stories.map(s => s.slug));
  if (slugs.size !== data.stories.length || slugs.has(undefined)) throw new Error('every story needs its own slug in data/stories.json');
  for (const s of data.stories) ap(`assets/story-data/${s.slug}.json`);   // run `npm run story-data` if this fails
  const art = {};
  for (const [key, file] of Object.entries(STORY_IMG)) {
    if (!known.has(key)) throw new Error('story art key matches no story: ' + key);
    ap(`assets/stories/lib/${file}`);
    art[key] = file;
  }
  for (const key of Object.keys(ALT_NAMES)) {
    if (!known.has(key)) throw new Error('alternate name key matches no story: ' + key);
  }
  for (const key of Object.keys(text)) {
    if (!slugs.has(key)) throw new Error('story text key matches no story slug: ' + key);
  }
  /* A SET_ORDER list and the set's actual membership must be the exact same set of ids in
     both directions -- one story added or removed from a set without updating its order
     here would either silently vanish from an ordered view or sort into an undefined
     position, and neither should happen quietly. */
  const cmdIds = COMMANDS.flatMap(c => c.ids);
  if (new Set(cmdIds).size !== cmdIds.length) throw new Error('COMMANDS lists a story under two commands');
  for (const [setName, order] of Object.entries(SET_ORDER)) {
    const actual = new Set(data.stories.filter(s => s.s.includes(setName)).map(s => s.id));
    const listed = new Set(order);
    for (const id of order) if (!actual.has(id)) throw new Error(`SET_ORDER["${setName}"] lists ${id}, which is not in that set`);
    for (const id of actual) if (!listed.has(id)) throw new Error(`SET_ORDER["${setName}"] is missing ${id}, a member of that set`);
  }
  /* Same in both directions for the Gospels: every Matthew/Mark/Luke/John story needs a
     position, and every position needs a real story, or a stale id would silently sort
     nothing while a real story silently fell back to unordered. */
  const gospelIds = new Set(data.stories.filter(s => ['Matthew', 'Mark', 'Luke', 'John'].includes(s.b)).map(s => s.id));
  for (const id of Object.keys(GOSPEL_ORDER)) if (!gospelIds.has(id)) throw new Error('GOSPEL_ORDER has ' + id + ', which is not a Gospel story');
  for (const id of gospelIds) if (!(id in GOSPEL_ORDER)) throw new Error('GOSPEL_ORDER is missing Gospel story ' + id);
  const payload = JSON.stringify({ ...data, groups: TESTAMENTS, abbr: ABBR, seticon: SET_ICON,
    art, alt: ALT_NAMES, txt: text, langNames, setOrder: SET_ORDER, gospelOrder: GOSPEL_ORDER,
    commands: Object.fromEntries(COMMANDS.flatMap(c => c.ids.map(id => [id, { n: c.n, r: c.r }]))) }).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Stories &middot; storying.app</title>
<meta name="description" content="Every story in the storying.app library, by book of the Bible, story set and theme.">
<meta name="theme-color" content="#1C3144">
<link rel="canonical" href="${OG_URL}stories">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="../${LOGOSQ}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="storying.app">
<meta property="og:url" content="${OG_URL}stories">
<meta property="og:title" content="Stories &middot; storying.app">
<meta property="og:description" content="Every story in the storying.app library, by book of the Bible, story set and theme.">
<meta property="og:image" content="${OG_URL}og_image.png">
<meta name="twitter:card" content="summary_large_image">
<style>${CSS}${STORIES_CSS}</style>
</head>
<body>
<header id="top">
  <div class="wrap bar">
    <a class="mk" href="../">
      <img src="../${LOGO}" alt="">
      <span class="mktext"><b>storying<span>.app</span></b><em>A library of oral Bible stories in 40 major languages</em></span>
    </a>
    <nav>${NAV.map(([id, label]) => `<a href="../#${id}">${label}</a>`).join('')}<a href="./" class="cur">Stories</a></nav>
    <a class="navcta" href="../#contact">Get involved</a>
    <button class="navburger" id="navBurger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="navMobile">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="navmobile" id="navMobile">
    <div class="wrap">
      <nav>${NAV.map(([id, label]) => `<a href="../#${id}">${label}</a>`).join('')}<a href="./">Stories</a>
        <a class="navcta" href="../#contact">Get involved</a></nav>
    </div>
  </div>
</header>
<main class="lib">
  <div class="wrap">
    <div class="libhead">
      <h1>Stories</h1>
      <p class="libcount"><b>${counted}</b> stories &middot; <b>${withSom}</b> including the Sermon on the Mount</p>
    </div>

    <div class="ctrls">
      <div class="cgrp csearch">
        <span class="eyebrow" id="lblSearch">Search<span class="scount" id="nShown" hidden></span></span>
        <div class="srch">
          ${ic('search', 17, '#8fa4b0')}
          <input id="q" type="search" placeholder="Search stories, text, references, books" autocomplete="off" aria-labelledby="lblSearch">
        </div>
      </div>
      <div class="cgrp cfilter">
        <span class="eyebrow" id="lblFilter">Filter
          <button class="cpill" id="clearFilters" hidden>${ic('x', 11, 'currentColor', 2.6)} Clear</button>
        </span>
        <div class="crow" role="group" aria-labelledby="lblFilter">
          <button class="fbtn" id="bSets" aria-expanded="false">${ic('playing-cards-fan', 15)} Story Sets <span class="n" id="nSets" hidden>0</span></button>
          <button class="fbtn" id="bTags" aria-expanded="false">${ic('tag', 15)} Tags <span class="n" id="nTags" hidden>0</span></button>
          <button class="fbtn" id="bLangs" aria-expanded="false">${ic('languages', 15)} Languages <span class="n" id="nLangs" hidden>0</span></button>
        </div>
      </div>
      <div class="cgrp cview">
        <span class="eyebrow" id="lblView">View</span>
        <div class="crow">
          <div class="views" role="group" aria-labelledby="lblView">
            <button data-v="grid" class="on">${ic('layout-grid', 15)} Grid</button>
            <button data-v="list">${ic('list', 15)} List</button>
            <button data-v="books" title="Books side by side">${ic('arrow-right', 15)} Books</button>
            <button data-v="vbooks" title="Books stacked">${ic('arrow-down', 15)} Books</button>
          </div>
        </div>
      </div>
    </div>
    <div class="drawer" id="dSets"></div>
    <div class="drawer" id="dTags"></div>
    <div class="drawer" id="dLangs"></div>

    <div id="view"></div>
    <div id="detail"></div>
  </div>
</main>
<footer>
  <div class="wrap fbar">
    <div class="fm"><img src="../${LOGOSQ}" alt="" loading="lazy"><b>storying<span>.app</span></b></div>
    <div>An audio-based, mobile-first library of oral Bible stories in 40+ languages.</div>
    <div><a href="mailto:brett@vmx.media">brett@vmx.media</a></div>
  </div>
</footer>
<script>
const D = ${payload};
/* Sets, tags, titles and references are changed in data/stories.json, not in the browser.
   (An earlier version let anyone edit them here and export the result; that is gone, and
   whatever it left in localStorage is simply never read.) */
const sets = s => s.s;
const tags = s => s.g;
const title = s => s.t;
const ref = s => s.r;
const alts = s => D.alt[key(s)] || [];
const key = s => s.b + '|' + s.t;
/* Crafted English text, keyed by slug. Only stories with reviewed text are in here. */
const body = s => D.txt[s.slug] || '';
const crafted = s => !!D.txt[s.slug];

/* Opening on all 202 stories in one expanded horizontal rail was the single biggest
   source of overwhelm in review. The page now starts on the grid, filtered to Creation to
   Christ, with the filter chrome showing that a filter is on and offering to clear it. */
const state = { v:'grid', q:'', sets:new Set(['Creation to Christ']), tags:new Set(), langs:new Set(),
                shut:new Set(), shutT:new Set(), showTags:false, showDups:true, hasImg:false };
/* Stacked books open with the sections closed, so the first thing you see is an outline.
   Kept separate from the side-by-side view's collapse state: a rail of eight narrow
   vertical spines is not a useful first impression, whereas a stack of headings is. */
state.shutV = new Set();
D.groups.forEach(([test, groups]) => groups.forEach(([g]) => state.shutV.add(test + '/' + g)));
/* Only English exists today. The filter is wired up properly so adding the other 39 is a
   data change, not a code change; selecting English matches everything, as it should. */
const LANGS = ['English'];
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const abbr = b => D.abbr[b] || b;
const seticon = n => D.seticon[n] ? '../assets/' + D.seticon[n] : '';
const filtering = () => !!(state.q || state.sets.size || state.tags.size || state.langs.size || state.hasImg);
/* Filtering by a tag always shows the tag rows: hiding what you are filtering on would be
   perverse. Otherwise it is the drawer's toggle. */
const showingTags = () => state.showTags || !!state.tags.size;
const anyFilter = () => !!(state.sets.size || state.tags.size || state.langs.size || state.hasImg);
/* A search term counts as a hit on a tag if either contains the other, so "money",
   "mone" and "money stories" all light up the Money tag. */
function tagHit(t){
  if (!state.q) return false;
  const a = t.toLowerCase();
  return a.includes(state.q) || state.q.includes(a);
}

function match(s){
  if (state.hasImg && !D.art[key(s)]) return false;
  if (state.sets.size) { const has = sets(s); if (![...state.sets].every(x => has.includes(x))) return false; }
  if (state.tags.size) { const has = tags(s); if (![...state.tags].every(x => has.includes(x))) return false; }
  if (state.q) {
    const hay = (title(s) + ' ' + alts(s).join(' ') + ' ' + s.b + ' ' + ref(s) + ' ' + s.par.join(' ') +
      ' ' + sets(s).join(' ') + ' ' + tags(s).join(' ') + ' ' + body(s)).toLowerCase();
    if (!hay.includes(state.q)) return false;
  }
  return true;
}
const shown = () => D.stories.filter(match);

/* List and Grid's display order, on top of shown()'s filtering. Both stay separate from
   shown() itself: bookData()'s callers only need the filtered set, not an order, and the
   Books views do their own per-book ordering (bookColumn/refKey) regardless. */
const BASE_IDX = new Map(D.stories.map((s, i) => [s.id, i]));
/* The whole Gospels block sits at one contiguous stretch of the library's default order
   (Matthew's rows, then Mark's, then Luke's, then John's, back to back) because the data
   is sorted by book. Anchoring the harmonized order at that stretch's own starting index,
   as a fraction small enough never to reach the next index, reorders the block internally
   without moving it relative to everything else -- no re-deriving where "the Gospels" sit
   among Genesis through Revelation, just re-sequencing what is already there. */
const GOSPEL_START = Math.min(...Object.keys(D.gospelOrder).map(id => BASE_IDX.get(id)));
function defaultKey(s){
  const g = D.gospelOrder[s.id];
  return g === undefined ? BASE_IDX.get(s.id) : GOSPEL_START + g / 1e6;
}
function orderedForDisplay(rows){
  const activeSet = state.sets.size === 1 ? [...state.sets][0] : null;
  const order = activeSet && D.setOrder[activeSet];
  if (order) {
    const pos = new Map(order.map((id, i) => [id, i]));
    return rows.slice().sort((a, z) => pos.get(a.id) - pos.get(z.id));
  }
  return rows.slice().sort((a, z) => defaultKey(a) - defaultKey(z));
}

/* Where a search landed, when it did not land somewhere already on the tile. Only the 13
   Creation to Christ stories have any English text yet, so this stays quiet elsewhere. */
function context(s){
  if (!state.q) return '';
  const q = state.q;
  if (title(s).toLowerCase().includes(q)) return '';
  if (alts(s).some(a => a.toLowerCase().includes(q))) return '';
  const t = body(s); if (!t) return '';
  const i = t.toLowerCase().indexOf(q); if (i < 0) return '';
  let a = Math.max(0, i - 55), b = Math.min(t.length, i + q.length + 75);
  if (a > 0) a = t.indexOf(' ', a) + 1;
  if (b < t.length) { const c = t.lastIndexOf(' ', b); if (c > i + q.length) b = c; }
  return '<div class="tctx">' + (a > 0 ? '&hellip;' : '') + esc(t.slice(a, i)) +
    '<mark>' + esc(t.slice(i, i + q.length)) + '</mark>' + esc(t.slice(i + q.length, b)) +
    (b < t.length ? '&hellip;' : '') + '</div>';
}
/* An alternate name only earns a line when it is why the story matched. */
function altLine(s){
  if (!state.q) return '';
  const hit = alts(s).find(a => a.toLowerCase().includes(state.q));
  return hit ? '<span class="talt">also: ' + esc(hit) + '</span>' : '';
}

function setPills(s){
  const v = sets(s); if (!v.length) return '';
  return '<div class="tsets">' + v.map(n => seticon(n)
    ? '<img src="' + seticon(n) + '" alt="' + esc(n) + '" title="' + esc(n) + '" loading="lazy">'
    : '<span class="ttag">' + esc(n) + '</span>').join('') + '</div>';
}
function tagPills(s, cls){
  const v = tags(s); if (!v.length) return '';
  return '<div class="' + (cls || 'ttags') + '">' + v.map(t =>
    '<span class="ttag' + (state.tags.has(t) ? ' on' : tagHit(t) ? ' hit' : '') + '">' +
    esc(t) + '</span>').join('') + '</div>';
}
const NOART = ${JSON.stringify(ic('book-open', 22, 'currentColor'))};
const TAGIC = ${JSON.stringify(ic('tag', 14, 'currentColor', 2.1))};
const IMGIC = ${JSON.stringify(ic('image', 14, 'currentColor', 2.1))};
/* Empty dashed square when off, the same square with a check in it when on. */
const DASH = { off: ${JSON.stringify(ic('square-dashed', 13, 'currentColor', 2.3))},
               on: ${JSON.stringify(ic('square-dashed-check', 13, 'currentColor', 2.3))} };
const TOG = { shut: ${JSON.stringify(ic('expand', 14, 'currentColor', 2.2))},
              open: ${JSON.stringify(ic('chevrons-right-left', 14, 'currentColor', 2.2))} };
const tog = isShut => '<span class="gtog">' + (isShut ? TOG.shut : TOG.open) + '</span>';
/* The stacked view's headers are plain full-width bars, not narrow spines the way a shut
   side-by-side column is, so a natural plus/minus reads better there than the expand icon. */
const VTOG = { shut: ${JSON.stringify(ic('plus', 13, 'currentColor', 2.3))},
               open: ${JSON.stringify(ic('minus', 13, 'currentColor', 2.3))} };
const vtog = isShut => '<span class="gtog">' + (isShut ? VTOG.shut : VTOG.open) + '</span>';
function art(s, cls){
  const f = D.art[key(s)];
  return '<div class="' + (cls || 'tph') + '">' + (f
    ? '<img src="../assets/stories/lib/' + f + '" alt="" loading="lazy" decoding="async">'
    : NOART) + '</div>';
}
/* Set icons inline after a title, like emoji. Shared by tiles and the mobile list row. */
function inlineSets(s, cls){
  const v = sets(s).filter(n => seticon(n)); if (!v.length) return '';
  return '<span class="' + (cls || 'tinline') + '">' + v.map(n => '<img src="' + seticon(n) +
    '" alt="' + esc(n) + '" title="' + esc(n) + '" loading="lazy">').join('') + '</span>';
}
/* The command a story illustrates, above its title: teal command name, gray verse. Shown only
   while 7 Commands is one of the active set filters -- Zacchaeus is a story first and
   illustrates "Repent and Believe" only when read through that set -- and only in Grid and
   List, the two views where a set's own order applies. The grid tile is about 140px wide, so
   there the verse always sits on its own line under the name; a line that wrapped only for
   the longer commands would leave the titles in a row misaligned. The list row has room
   for the one-line form, name then "- verse". */
function cmdLine(s, stacked){
  const c = state.sets.has('7 Commands') && D.commands[s.id];
  return c ? '<span class="tcmd' + (stacked ? ' stk' : '') + '"><span class="tcn">' + esc(c.n) + '</span> <span class="tcr">' +
    (stacked ? '' : '- ') + esc(c.r) + '</span></span>' : '';
}
/* One markup for both tile shapes; .cmp re-lays it out for the narrow book columns. */
function tile(s, compact){
  return '<button class="tile' + (compact ? ' cmp' : '') + '" data-id="' + s.id + '">' +
    art(s) +
    '<div class="tmain">' + (compact ? '' : cmdLine(s, true)) +
      '<div class="tt">' + esc(title(s)) + inlineSets(s) + '</div>' + altLine(s) +
      '<div class="tr">' + esc(abbr(s.b) + ' ' + ref(s)) + '</div>' +
    '</div>' + tagPills(s) + context(s) + '</button>';
}

/* First chapter and verse in a reference, for ordering a book column. Handles "3",
   "1-2:3", "7:14-12:30" and "12:1-5,15:1-6,17,21:1-7" alike: the first number is the
   chapter, and a colon straight after it means the next number is the verse. */
function refKey(r){
  /* [0-9] rather than \\d: this whole script is inside a template literal, which eats a
     single backslash before it ever reaches the browser. */
  const m = String(r).match(/([0-9]+)(?::([0-9]+))?/);
  return m ? [+m[1], m[2] ? +m[2] : 0] : [999, 0];
}
/* ---- books: the same data, laid out side by side or stacked ---- */
function bookData(){
  const keep = new Set(shown().map(s => s.id));
  const filt = filtering();
  const byBook = {}; const dupsBy = {};
  D.stories.forEach(s => { if (keep.has(s.id)) (byBook[s.b] = byBook[s.b] || []).push(s); });
  /* A duplicate rides along with the story it parallels. The two that have no main to
     point at are coverage notes, not stories, so they only belong in the unfiltered view. */
  if (state.showDups) D.dups.forEach(d => { if (d.of ? keep.has(d.of) : !filt) (dupsBy[d.b] = dupsBy[d.b] || []).push(d); });
  const mainOf = {}; D.stories.forEach(s => mainOf[s.id] = s);
  return { byBook: byBook, dupsBy: dupsBy, mainOf: mainOf };
}
/* Mains and parallels in one list, ordered by where they fall in the book. The original
   index breaks ties, so equal references keep the spreadsheet's order and a main always
   precedes a parallel that starts at the same verse. */
function bookColumn(items, dp, mainOf){
  return items.map((s, i) => ({ s: s, k: refKey(ref(s)), i: i }))
    .concat(dp.map((d, i) => ({ d: d, k: refKey(d.r), i: 1000 + i })))
    .sort((a, z) => a.k[0] - z.k[0] || a.k[1] - z.k[1] || a.i - z.i)
    .map(x => x.s ? tile(x.s, true) : dupTile(x.d, mainOf)).join('');
}
function dupTile(d, mainOf){
  const m = d.of ? mainOf[d.of] : null;
  return '<div class="tile dup"><div class="tt">' + esc(d.t) + '</div><div class="tr">' +
    esc(abbr(d.b) + ' ' + d.r) + '</div><div class="dupof">' +
    (m ? 'told from ' + esc(abbr(m.b) + ' ' + m.r) : 'parallel passage') + '</div></div>';
}
const dupPill = () => '<span class="dupsw" role="switch" aria-checked="' + state.showDups +
  '" data-showdups>' + (state.showDups ? DASH.on : DASH.off) + 'Show parallel stories</span>';
/* One button that flips between opening and closing every section under a testament,
   depending on whether any of them is currently shut. Icon and verb both follow that: the
   plus/"Expand all" pairing means the same thing an individual section's own plus does. */
function expandAllPill(test, groups){
  const allOpen = groups.every(([gname]) => !state.shutV.has(test + '/' + gname));
  return '<span class="expsw" data-expandall="' + esc(test) + '">' +
    (allOpen ? VTOG.open : VTOG.shut) + (allOpen ? 'Collapse all' : 'Expand all') + '</span>';
}

function renderBooks(){
  const D2 = bookData(); const byBook = D2.byBook, dupsBy = D2.dupsBy, mainOf = D2.mainOf;
  let h = '';
  D.groups.forEach(([test, groups]) => {
    const tn = groups.reduce((a, g) => a + g[1].reduce((x, b) => x + (byBook[b] || []).length, 0), 0);
    const tShut = state.shutT.has(test);
    h += '<section class="btest' + (tShut ? ' shut' : '') + '" data-t="' + esc(test) + '">' +
      '<button class="thead t1" aria-expanded="' + !tShut + '"><span class="hin">' + tog(tShut) +
      '<span class="lbl">' + esc(test) + '</span><span class="gn">' + tn + '</span></span></button><div class="tgrps">';
    groups.forEach(([gname, books]) => {
      const key = test + '/' + gname;
      const n = books.reduce((a, b) => a + (byBook[b] || []).length, 0);
      const gShut = state.shut.has(key);
      h += '<div class="tgroup' + (gShut ? ' shut' : '') + '" data-g="' + esc(key) + '">' +
        '<button class="thead t2" aria-expanded="' + !gShut + '"><span class="hin">' + tog(gShut) +
        '<span class="lbl">' + esc(gname) + '</span><span class="gn">' + n + '</span></span>' +
        (gname === 'Gospels' ? dupPill() : '') + '</button><div class="brow">';
      books.forEach(b => {
        const items = byBook[b] || []; const dp = dupsBy[b] || [];
        const empty = !items.length && !dp.length;
        h += '<div class="bcol' + (empty ? ' empty' : '') + '"><div class="bname"><span>' + esc(empty ? abbr(b) : b) + '</span>' +
          (items.length ? '<span class="bn">' + items.length + '</span>' : '') + '</div><div class="bstack">' +
          bookColumn(items, dp, mainOf) + '</div></div>';
      });
      h += '</div></div>';
    });
    h += '</div></section>';
  });
  return '<div class="booksout"><div class="btop"><div class="bthumb"></div></div>' +
    '<div class="books" id="books"><div class="brail">' + h + '</div></div></div>';
}

/* ---- books, stacked: testament over section over book, stories running right ---- */
function renderVBooks(){
  const D2 = bookData(); const byBook = D2.byBook, dupsBy = D2.dupsBy, mainOf = D2.mainOf;
  let h = '';
  D.groups.forEach(([test, groups]) => {
    const tn = groups.reduce((a, g) => a + g[1].reduce((x, b) => x + (byBook[b] || []).length, 0), 0);
    const tShut = state.shutT.has(test);
    h += '<section class="vtest' + (tShut ? ' shut' : '') + '" data-t="' + esc(test) + '">' +
      '<button class="vhead v1" aria-expanded="' + !tShut + '">' + vtog(tShut) +
      '<span class="lbl">' + esc(test) + '</span><span class="gn">' + tn + '</span>' +
      expandAllPill(test, groups) + '</button>';
    groups.forEach(([gname, books]) => {
      const key = test + '/' + gname;
      const gShut = state.shutV.has(key);
      const n = books.reduce((a, b) => a + (byBook[b] || []).length, 0);
      /* Parallels only matters once there is something to look at, so it waits for the
         group it belongs to to actually be open rather than sitting on the closed bar. */
      h += '<div class="vgroup' + (gShut ? ' shut' : '') + '" data-g="' + esc(key) + '">' +
        '<button class="vhead v2" aria-expanded="' + !gShut + '">' + vtog(gShut) +
        '<span class="lbl">' + esc(gname) + '</span><span class="gn">' + n + '</span>' +
        (gname === 'Gospels' && !gShut ? dupPill() : '') + '</button><div class="vbooks">';
      books.forEach(b => {
        const items = byBook[b] || []; const dp = dupsBy[b] || [];
        const empty = !items.length && !dp.length;
        h += '<div class="vbook' + (empty ? ' empty' : '') + '"><div class="vbname"><span>' + esc(b) + '</span>' +
          (items.length ? '<span class="bn">' + items.length + '</span>' : '') + '</div>' +
          '<div class="vrow">' + bookColumn(items, dp, mainOf) + '</div></div>';
      });
      h += '</div></div>';
    });
    h += '</section>';
  });
  return '<div class="vbooksv">' + h + '</div>';
}

function renderList(){
  const rows = orderedForDisplay(shown());
  if (!rows.length) return '<p class="none">No stories match those filters.</p>';
  /* The image column is deliberately unlabelled. */
  let h = '<div class="listv"><div class="lrow h"><span class="lnum">#</span><span></span><span>Story</span>' +
    '<span>Reference</span><span class="lcr">Crafted</span><span>Story Sets</span><span>Tags</span></div>';
  rows.forEach((s, i) => {
    /* Set icons ride inline after the title on narrow screens, like emoji, and sit in
       their own column on desktop. Same markup, two layouts. */
    h += '<button class="lrow" data-id="' + s.id + '"><span class="lnum">' + (i + 1) + '</span>' +
      art(s, 'lph') +
      '<span class="lt2">' + cmdLine(s) + esc(title(s)) + (s.som ? ' <span class="som">SERMON</span>' : '') +
        inlineSets(s, 'lsets') + altLine(s) + '</span>' +
      '<span class="lref">' + esc(abbr(s.b) + ' ' + ref(s)) + '</span>' +
      '<span class="lcr">' + (crafted(s) ? '<span role="img" aria-label="Crafted">✅</span>' : '') + '</span>' +
      '<span class="lsetcol">' + (setPills(s) || '<span class="lref">&mdash;</span>') + '</span>' +
      (tagPills(s, 'ltags') || '<span class="ltags"></span>') +
      context(s) + '</button>';
  });
  return h + '</div>';
}
function renderGrid(){
  const rows = orderedForDisplay(shown());
  if (!rows.length) return '<p class="none">No stories match those filters.</p>';
  return '<div class="gridv">' + rows.map(s => tile(s)).join('') + '</div>';
}

function drawers(){
  const setCount = {}, tagCount = {};
  D.stories.forEach(s => { sets(s).forEach(x => setCount[x] = (setCount[x] || 0) + 1);
                           tags(s).forEach(x => tagCount[x] = (tagCount[x] || 0) + 1); });
  $('dSets').innerHTML = '<div class="dgrp"><h4>Story Sets</h4><div class="fchips g4">' +
    D.sets.map(n => '<button class="chip' + (state.sets.has(n) ? ' on' : '') + '" data-set="' + esc(n) + '">' +
      (seticon(n) ? '<img src="' + seticon(n) + '" alt="" loading="lazy">' : '') + esc(n) +
      '<span class="cnt">' + (setCount[n] || 0) + '</span></button>').join('') +
    '</div></div><div style="margin-top:12px"><button class="clearall" data-clear="sets">Clear story sets</button></div>';
  $('dLangs').innerHTML = '<div class="dgrp"><h4>Languages</h4><div class="fchips">' +
    LANGS.map(n => '<button class="chip' + (state.langs.has(n) ? ' on' : '') + '" data-lang="' + esc(n) + '">' +
      esc(n) + '<span class="cnt">' + D.stories.length + '</span></button>').join('') +
    '</div><p class="dnote">The other 39 languages land here as they are produced.</p></div>' +
    '<div style="margin-top:12px"><button class="clearall" data-clear="langs">Clear languages</button></div>';
  /* One control for the whole page, rather than the same button repeated on 202 cards. */
  $('dTags').innerHTML = '<div class="dgrp"><div class="swrowset">' +
    '<button class="swrow" role="switch" aria-checked="' + showingTags() + '" data-showtags>' +
      '<span class="swt"></span><span class="swlbl">Show tags on stories<span class="tagwrap">' + TAGIC + '</span></span></button>' +
    '<button class="swrow" role="switch" aria-checked="' + state.hasImg + '" data-hasimg>' +
      '<span class="swt"></span><span class="swlbl">Has story image' + IMGIC + '</span></button>' +
    '</div>' +
    (state.tags.size ? '<p class="dnote">Shown automatically while a tag filter is on.</p>' : '') +
    '</div>' +
    Object.entries(D.vocab).map(([g, list]) =>
    '<div class="dgrp"><h4>' + esc(g) + '</h4><div class="fchips">' + list.map(t =>
      '<button class="chip' + (state.tags.has(t) ? ' on' : '') + '" data-tag="' + esc(t) + '">' + esc(t) +
      '<span class="cnt">' + (tagCount[t] || 0) + '</span></button>').join('') + '</div></div>').join('') +
    '<div style="margin-top:12px"><button class="clearall" data-clear="tags">Clear tags</button></div>';
}

function render(){
  /* Collapsing a group re-renders the whole rail, so hold the scroll position or the
     view snaps back to Genesis every time. */
  const old = $('books'); const sx = old ? old.scrollLeft : 0;
  $('view').innerHTML = state.v === 'books' ? renderBooks()
    : state.v === 'vbooks' ? renderVBooks()
    : state.v === 'list' ? renderList() : renderGrid();
  const rail = $('books');
  if (rail && sx) rail.scrollLeft = sx;
  mountHscrolls();
  $('view').classList.toggle('showtags', showingTags());
  const filtered = filtering();
  $('nShown').hidden = !filtered;
  $('nShown').textContent = '(' + shown().length + ')';
  const badge = (n, b, set) => { $(n).hidden = !set.size; $(n).textContent = set.size;
    $(b).classList.toggle('on', !!set.size); };
  badge('nSets', 'bSets', state.sets);
  /* Not a Set: the Has Story Image switch lives in this same drawer and counts as an
     active filter too, so it rides on the Tags button's own badge rather than going
     unrepresented there. */
  const tagN = state.tags.size + (state.hasImg ? 1 : 0);
  $('nTags').hidden = !tagN; $('nTags').textContent = tagN;
  $('bTags').classList.toggle('on', !!tagN);
  badge('nLangs', 'bLangs', state.langs);
  $('clearFilters').hidden = !anyFilter();
  drawers();
}

/* The side-by-side rail's drawn scrollbar is mounted the same way any number of these
   could be: a .btop bar immediately followed by the scrollable element it controls.
   Rebuilt on every render, since #view's DOM is replaced wholesale; one resize listener
   redraws whichever bars currently exist. */
let hbarDraws = [];
addEventListener('resize', () => hbarDraws.forEach(d => d()), { passive: true });

function mountHscrolls(){
  hbarDraws = [...document.querySelectorAll('.btop')].map(bar => mountHscroll(bar, bar.nextElementSibling));
}

function mountHscroll(bar, rail){
  const thumb = bar.firstElementChild;
  const room = () => rail.scrollWidth - rail.clientWidth;
  function draw(){
    if (room() < 1) { bar.hidden = true; return; }
    bar.hidden = false;
    const track = bar.clientWidth;
    const w = Math.max(36, Math.round(track * rail.clientWidth / rail.scrollWidth));
    thumb.style.width = w + 'px';
    thumb.style.transform = 'translateX(' + (track - w) * (rail.scrollLeft / room()) + 'px)';
  }
  /* grab is where in the thumb the pointer took hold, so it does not jump on mousedown. */
  function seek(clientX, grab){
    const track = bar.clientWidth, w = thumb.offsetWidth;
    const x = clientX - bar.getBoundingClientRect().left - grab;
    rail.scrollLeft = room() * Math.min(1, Math.max(0, x / (track - w)));
  }
  thumb.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    const grab = e.clientX - thumb.getBoundingClientRect().left;
    thumb.classList.add('drag');
    const move = ev => seek(ev.clientX, grab);
    const up = () => { thumb.classList.remove('drag');
      removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
  });
  /* Clicking the track jumps the thumb to the pointer and keeps dragging from there. */
  bar.addEventListener('pointerdown', e => {
    seek(e.clientX, thumb.offsetWidth / 2);
    thumb.dispatchEvent(new PointerEvent('pointerdown', { clientX: e.clientX, bubbles: false }));
  });
  rail.addEventListener('scroll', draw, { passive: true });
  draw();
  return draw;
}

/* ---- filter drawers ---- */
const DRAWERS = { bSets: 'dSets', bTags: 'dTags', bLangs: 'dLangs' };
function closeDrawers(){
  Object.entries(DRAWERS).forEach(([b, d]) => {
    $(d).classList.remove('open'); $(b).setAttribute('aria-expanded', 'false');
  });
}
function toggleDrawer(which){
  const mine = DRAWERS[which];
  const open = !$(mine).classList.contains('open');
  closeDrawers();
  if (open) { $(mine).classList.add('open'); $(which).setAttribute('aria-expanded', 'true'); }
}

/* ---- story detail ----
   Opening a story swaps the list for a full page of its own inside this same page: the filters,
   the view and the scroll position stay in memory and come back exactly as you left them. The
   address is "#slug" (so a story can be linked to, and the browser's Back button closes it),
   and every slug is provisional until the story-title review is done. Everything heavy, the
   Bible text above all, is fetched from assets/story-data/{slug}.json only when a story is
   opened, so the library itself stays small. No client code in this block may use a
   backtick, a dollar-brace or a backslash: the whole script is inside a template literal. */
const bySlug = new Map(D.stories.map(s => [s.slug, s]));
const detailCache = new Map();
let detailSlug = null, listScroll = 0, openedFromList = false, lastFocusId = null;
const baseTitle = document.title;

function loadDetail(s){
  if (detailCache.has(s.slug)) return Promise.resolve(detailCache.get(s.slug));
  return fetch('../assets/story-data/' + s.slug + '.json')
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(j => { detailCache.set(s.slug, j); return j; });
}
/* The stories either side of this one in the order the list is showing. A story reached from
   a link that the current filters would hide falls back to the whole library in its default order. */
function neighbours(s){
  let rows = orderedForDisplay(shown());
  if (!rows.some(r => r.id === s.id)) rows = D.stories.slice().sort((a, z) => defaultKey(a) - defaultKey(z));
  const i = rows.findIndex(r => r.id === s.id);
  return { prev: rows[i - 1] || null, next: rows[i + 1] || null };
}
function chipsBlock(label, names, attr, withIcon){
  if (!names.length) return '';
  return '<div class="sdvlbl">' + label + '</div><div class="sdvchips">' + names.map(n =>
    '<button class="chip" data-' + attr + '="' + esc(n) + '">' +
    (withIcon && seticon(n) ? '<img src="' + seticon(n) + '" alt="" loading="lazy">' : '') + esc(n) + '</button>').join('') + '</div>';
}
const CHEV = '<svg class="sdvchev" viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 5 16 12 9 19"/></svg>';
function navBtn(s, dir){
  if (!s) return '';
  const f = D.art[key(s)];
  const th = '<span class="sdvnth">' + (f ? '<img src="../assets/stories/lib/' + f + '" alt="" loading="lazy">' : NOART) + '</span>';
  const tx = '<span class="sdvnt"><small>' + (dir === 'prev' ? 'Previous story' : 'Next story') + '</small><b>' + esc(title(s)) + '</b></span>';
  return '<button class="sdvnb ' + dir + '" data-gostory="' + esc(s.slug) + '">' +
    (dir === 'prev' ? CHEV + th + tx : tx + th + CHEV) + '</button>';
}
const DL_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
/* Cover and title side by side on wider screens, then one column of cards (listen, storyboard, read). The extras that only make sense in a library
   (tags, details, previous and next) follow below them. */
function detailShell(s){
  const f = D.art[key(s)], alt = alts(s), nb = neighbours(s), ss = sets(s);
  return '<div class="sdvwrap"><button class="sdvback" data-back>&larr; Back to stories</button>' +
    '<div class="sdvtop"><div class="sdvcover">' + (f ? '<img src="../assets/stories/lib/' + f + '" alt="">' : NOART) + '</div>' +
    '<div class="sdvhead">' +
      cmdLine(s) + '<h1 id="sdvh1" tabindex="-1">' + esc(title(s)) + '</h1>' +
      '<div class="sdvmeta"><span class="sdvref">' + esc(s.b + ' ' + ref(s)) + '</span>' + (crafted(s)
        ? '<span class="sdvpill ok"><span aria-hidden="true">✅</span> Crafted</span>'
        : '<span class="sdvpill">Not yet crafted</span>') + '</div>' +
      (alt.length ? '<div class="sdvalso">Also called ' + alt.map(esc).join(', ') + '</div>' : '') +
      (s.par.length ? '<div class="sdvalso">Also see ' + s.par.map(esc).join('; ') + '</div>' : '') +
      chipsBlock('Story sets', ss, 'goset', true) + chipsBlock('Tags', tags(s), 'gotag', false) +
    '</div></div>' +
    '<div id="sdvbody"><p class="sdvnote">Loading&hellip;</p></div>' +
    '<nav class="sdvnav" aria-label="More stories">' + navBtn(nb.prev, 'prev') + navBtn(nb.next, 'next') + '</nav></div>';
}
/* Verse numbers are small raised numbers inside the running text. A passage that crosses
   chapters writes "c:v" at the first verse of each new chapter. */
function bsbHtml(sections){
  return sections.map(sec => {
    let lastC = null, p = '';
    sec.v.forEach(v => {
      const mark = (v[0] !== null && v[0] !== lastC) ? v[0] + ':' + v[1] : String(v[1]);
      if (v[0] !== null) lastC = v[0];
      p += '<sup class="sdvn">' + mark + '</sup>' + esc(v[2]) + ' ';
    });
    return (sec.h ? '<h3 class="sdvpass">' + esc(sec.h) + '</h3>' : '') + '<p>' + p.trim() + '</p>';
  }).join('');
}
function fmtT(t){ t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); }
/* The player is our own markup over a hidden audio element, so it looks the same in every browser. */
function initPlayer(){
  const box = document.querySelector('#sdvbody .sdvplay'); if (!box) return;
  const au = box.querySelector('audio'); if (!au) return;
  const seek = box.querySelector('.sdvseek'), cur = box.querySelector('[data-cur]'), dur = box.querySelector('[data-dur]'), pp = box.querySelector('[data-pp]');
  const paint = () => {
    const d = au.duration, p = d ? (au.currentTime / d) * 100 : 0;
    seek.value = d ? Math.round((au.currentTime / d) * 1000) : 0;
    seek.style.setProperty('--p', p + '%'); cur.textContent = fmtT(au.currentTime);
    if (d) dur.textContent = fmtT(d);
  };
  const state = () => { const on = !au.paused; box.classList.toggle('playing', on); pp.setAttribute('aria-label', (on ? 'Pause ' : 'Play ') + au.getAttribute('aria-label')); };
  au.setAttribute('aria-label', document.querySelector('#sdvh1').textContent);
  pp.setAttribute('aria-label', 'Play ' + au.getAttribute('aria-label'));
  pp.addEventListener('click', () => { au.paused ? au.play().catch(() => {}) : au.pause(); });
  seek.addEventListener('input', () => { if (au.duration) au.currentTime = (seek.value / 1000) * au.duration; paint(); });
  ['timeupdate', 'loadedmetadata', 'durationchange', 'seeked'].forEach(ev => au.addEventListener(ev, paint));
  ['play', 'pause', 'ended'].forEach(ev => au.addEventListener(ev, state));
}
function fillDetail(s, j){
  const cr = !!j.text;
  const PLAY = '<svg class="sdvi1" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg><svg class="sdvi2" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
  const player = (on, src, dur) => '<div class="sdvplay' + (on ? '' : ' off') + '">' + (on ? '<audio preload="metadata" src="' + src + '"></audio>' : '') +
    '<button class="sdvpp" data-pp aria-label="' + (on ? 'Play ' + esc(title(s)) : 'Audio not available') + '"' + (on ? '' : ' disabled') + '>' + PLAY + '</button>' +
    '<div class="sdvtrk"><input class="sdvseek" type="range" min="0" max="1000" value="0" step="1" aria-label="Seek"' + (on ? '' : ' disabled') + '>' +
    '<div class="sdvtimes"><span data-cur>0:00</span><span data-dur>' + (on && dur ? esc(dur) : '0:00') + '</span></div></div></div>';
  let h = '<section class="sdvc"><div class="sdvlisthead"><h2 class="sdvlab">Listen</h2>';
  if (j.audio) {
    const src = '../assets/' + esc(j.audio.src);
    h += '<a class="sdvdlbtn" href="' + src + '" download="' + esc(s.slug) + '.mp3" aria-label="Download audio">' + DL_ICON + '</a></div>' +
      player(true, src, j.audio.dur) + '<p class="sdvnote">English</p>';
  } else {
    h += '</div>' + player(false) + '<p class="sdvnote">Audio is not available for this story yet.</p>';
  }
  h += '</section>';
  if (j.board) {
    const bs = '../assets/' + esc(j.board.src);
    h += '<section class="sdvc sdvboard"><div class="sdvlisthead"><h2 class="sdvlab">Storyboard</h2>' +
      '<a class="sdvdlbtn" href="' + bs + '" download="' + esc(s.slug) + '-storyboard.webp" aria-label="Download storyboard">' + DL_ICON + '</a></div>' +
      '<img src="' + bs + '" alt="Storyboard for ' + esc(title(s)) + '" loading="lazy"></section>';
  }
  const moreBtn = '<div class="sdvfade"></div><div class="sdvmorewrap"><button class="sdvmore" data-more aria-expanded="false">Read more &darr;</button></div>';
  if (cr) {
    h += '<section class="sdvc read"><h2 class="sdvlab">Read <small>English</small></h2><div class="sdvtext sdvclamp">' +
      j.text.paras.map(p => '<p>' + esc(p) + '</p>').join('') + '</div>' + moreBtn +
      '<details class="sdvdet"><summary>Bible text (Berean Standard Bible)</summary><div class="sdvtext sdvbsb">' + bsbHtml(j.bsb) + '</div></details></section>';
  } else {
    h += '<section class="sdvc read"><h2 class="sdvlab">Read <small>Bible text, Berean Standard Bible</small></h2>' +
      '<p class="sdvnote" style="margin:0 0 14px">The crafted oral story for this passage is not ready yet. This is the passage it will be drawn from.</p>' +
      '<div class="sdvtext sdvbsb sdvclamp">' + bsbHtml(j.bsb) + '</div>' + moreBtn + '</section>';
  }
  h += '<section class="sdvc"><h2 class="sdvlab">Details</h2><dl class="sdvdl">' +
    '<dt>Audio</dt><dd>' + (j.audio ? 'English' : 'Not available yet') + '</dd>' +
    '<dt>Storyboard</dt><dd>' + (j.board ? 'Available' : 'Not drawn yet') + '</dd>' +
    '<dt>Languages</dt><dd>' + (cr ? 'English (1 of ' + D.langNames.length + ')' : 'Not available in any language yet') +
      '<details class="sdvdet"><summary>All ' + D.langNames.length + ' languages</summary><div class="sdvlangs">' +
      D.langNames.map(n => '<span class="sdvlang' + (cr && n === 'English' ? ' on' : '') + '">' + esc(n) + '</span>').join('') + '</div></details></dd>' +
    '<dt>Bible text</dt><dd>Berean Standard Bible (public domain)</dd>' +
    '<dt>Suggest a change</dt><dd><a class="sdvlink" href="mailto:brett@vmx.media?subject=' + encodeURIComponent('Story: ' + title(s)) + '">Email a correction</a></dd>' +
    '</dl></section>';
  $('sdvbody').innerHTML = h;
  initPlayer();
  /* A passage short enough to fit the clamp needs no Read more. */
  document.querySelectorAll('#sdvbody .sdvclamp').forEach(el => {
    if (el.scrollHeight <= el.clientHeight + 6) {
      el.classList.add('open'); el.nextElementSibling.classList.add('gone'); el.nextElementSibling.nextElementSibling.hidden = true;
    }
  });
}
function showDetail(s){
  detailSlug = s.slug;
  document.querySelector('main.lib').classList.add('detailing');
  document.title = s.t + ' · storying.app';
  $('detail').innerHTML = detailShell(s);
  /* "instant" because the shared stylesheet sets scroll-behavior:smooth on the whole page,
     and opening a story should jump to its top, not glide there from wherever the list was. */
  scrollTo({ top: 0, left: 0, behavior: 'instant' });
  $('sdvh1').focus({ preventScroll: true });
  loadDetail(s).then(j => { if (detailSlug === s.slug) fillDetail(s, j); }).catch(() => {
    if (detailSlug === s.slug) $('sdvbody').innerHTML = '<p class="sdvnote">This story could not be loaded. Check your connection and <button class="sdvmore" data-retry>try again</button>.</p>';
  });
}
function hideDetail(){
  if (!detailSlug) return;
  detailSlug = null;
  document.querySelector('main.lib').classList.remove('detailing');
  document.title = baseTitle;
  $('detail').innerHTML = '';
  /* The list was only hidden, never rebuilt, so it can be scrolled and focused straight away. */
  scrollTo({ top: listScroll, left: 0, behavior: 'instant' });
  const t = lastFocusId && document.querySelector('[data-id="' + lastFocusId + '"]');
  if (t) t.focus({ preventScroll: true });
}
function route(){
  const s = bySlug.get(decodeURIComponent(location.hash.slice(1)));
  s ? showDetail(s) : hideDetail();
}
function openStory(id){
  const s = D.stories.find(x => x.id === id); if (!s) return;
  listScroll = scrollY; lastFocusId = id; openedFromList = true;
  location.hash = s.slug;
}
/* Back goes to the list the visitor came from; a story opened straight from a link has no list
   behind it, so the hash is just cleared. */
function closeDetail(){
  if (openedFromList) history.back();
  else { history.replaceState(null, '', location.pathname + location.search); hideDetail(); }
}
/* Leave a story for the list with one filter applied, such as a tag or a set clicked on its page. */
function goFilter(apply){
  state.sets.clear(); state.tags.clear(); state.langs.clear(); state.hasImg = false; state.q = ''; $('q').value = '';
  apply(); listScroll = 0; lastFocusId = null; closeDrawers(); render(); closeDetail();
}
addEventListener('hashchange', route);
history.scrollRestoration = 'manual';

document.addEventListener('click', e => {
  /* Anywhere outside a drawer or its own toggle closes the open drawer. */
  if (!e.target.closest('.drawer') && !e.target.closest('#bSets') && !e.target.closest('#bTags')
      && !e.target.closest('#bLangs')) closeDrawers();
  /* Inside the group header button, so it has to be caught first. A span rather than a
     nested <button>, which browsers will not nest. */
  const dw = e.target.closest('.dupsw');
  if (dw) { state.showDups = !state.showDups; render(); e.stopPropagation(); return; }
  const ea = e.target.closest('.expsw');
  if (ea) {
    const test = ea.dataset.expandall;
    const groups = D.groups.find(g => g[0] === test)[1];
    const allOpen = groups.every(([gname]) => !state.shutV.has(test + '/' + gname));
    groups.forEach(([gname]) => { const key = test + '/' + gname;
      allOpen ? state.shutV.add(key) : state.shutV.delete(key); });
    render(); e.stopPropagation(); return;
  }
  const t = e.target.closest('button'); if (!t) return;
  /* Set from the effective value, so the first click after a tag filter forces it open
     does the thing the label promises rather than silently flipping a hidden flag. */
  if (t.dataset.showtags !== undefined) { state.showTags = !showingTags(); render(); return; }
  if (t.dataset.hasimg !== undefined) { state.hasImg = !state.hasImg; render(); return; }
  if (t.dataset.v) { state.v = t.dataset.v; document.querySelectorAll('.views button').forEach(b => b.classList.toggle('on', b === t)); render(); return; }
  if (DRAWERS[t.id]) { toggleDrawer(t.id); return; }
  if (t.dataset.set) { state.sets.has(t.dataset.set) ? state.sets.delete(t.dataset.set) : state.sets.add(t.dataset.set); render(); return; }
  if (t.dataset.tag) { state.tags.has(t.dataset.tag) ? state.tags.delete(t.dataset.tag) : state.tags.add(t.dataset.tag); render(); return; }
  if (t.dataset.lang) { state.langs.has(t.dataset.lang) ? state.langs.delete(t.dataset.lang) : state.langs.add(t.dataset.lang); render(); return; }
  if (t.dataset.clear) { state[t.dataset.clear].clear(); if (t.dataset.clear === 'tags') state.hasImg = false; render(); return; }
  if (t.id === 'clearFilters') { state.sets.clear(); state.tags.clear(); state.langs.clear(); state.hasImg = false; closeDrawers(); render(); return; }
  if (t.classList.contains('vhead')) {
    if (t.classList.contains('v1')) { const k = t.closest('.vtest').dataset.t;
      state.shutT.has(k) ? state.shutT.delete(k) : state.shutT.add(k); }
    else { const g = t.closest('.vgroup').dataset.g;
      state.shutV.has(g) ? state.shutV.delete(g) : state.shutV.add(g); }
    render(); return;
  }
  if (t.classList.contains('thead')) {
    if (t.classList.contains('t1')) { const k = t.closest('.btest').dataset.t;
      state.shutT.has(k) ? state.shutT.delete(k) : state.shutT.add(k); }
    else { const g = t.closest('.tgroup').dataset.g;
      state.shut.has(g) ? state.shut.delete(g) : state.shut.add(g); }
    render(); return;
  }
  if (t.classList.contains('tile') && !t.classList.contains('dup')) { openStory(t.dataset.id); return; }
  if (t.classList.contains('lrow') && t.dataset.id) { openStory(t.dataset.id); return; }
  if (t.dataset.back !== undefined) { closeDetail(); return; }
  if (t.dataset.gostory) { location.replace('#' + t.dataset.gostory); return; }
  if (t.dataset.goset) { goFilter(() => state.sets.add(t.dataset.goset)); return; }
  if (t.dataset.gotag) { goFilter(() => state.tags.add(t.dataset.gotag)); return; }
  if (t.dataset.retry !== undefined) { const s = bySlug.get(detailSlug); if (s) showDetail(s); return; }
  if (t.dataset.more !== undefined) {
    const wrap = t.closest('.sdvmorewrap'), el = wrap.previousElementSibling.previousElementSibling, open = !el.classList.contains('open');
    el.classList.toggle('open', open); wrap.previousElementSibling.classList.toggle('gone', open); t.setAttribute('aria-expanded', String(open));
    t.innerHTML = open ? 'Read less &uarr;' : 'Read more &darr;'; return;
  }
});
addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (detailSlug) closeDetail(); else closeDrawers(); });
let qt; $('q').addEventListener('input', e => { clearTimeout(qt);
  qt = setTimeout(() => { state.q = e.target.value.trim().toLowerCase(); render(); }, 140); });
render();
route();
</script>
<script>
(function(){
  var top=document.getElementById('top'),bar=top.querySelector('.bar');
  var burger=document.getElementById('navBurger'),mobile=document.getElementById('navMobile');
  function close(){top.classList.remove('open');burger.setAttribute('aria-expanded','false')}
  /* The books rail bleeds to the window edge off this, and 100vw would include the
     vertical scrollbar. */
  function vw(){document.documentElement.style.setProperty('--vw',document.documentElement.clientWidth+'px')}
  vw();addEventListener('resize',vw,{passive:true});
  function fit(){top.classList.remove('collapsed');
    var o=bar.scrollWidth>bar.clientWidth+1;top.classList.toggle('collapsed',o);if(!o)close()}
  fit();
  var t;addEventListener('resize',function(){clearTimeout(t);t=setTimeout(fit,120)},{passive:true});
  burger.addEventListener('click',function(){var o=top.classList.toggle('open');burger.setAttribute('aria-expanded',o?'true':'false')});
  mobile.addEventListener('click',function(e){if(e.target.tagName==='A')close()});
})();
</script>
</body></html>`;
}
