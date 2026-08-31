<?php

declare(strict_types=1);

$settings = [
    'site_title' => 'Bihar State Educational Development & Research Council',
    'home_title' => 'Har talent ko milni chahiye opportunity to shine.',
    'home_subtitle' => 'Hum exams aur sahi pehchaan ke zariye Bihar ke honhaar students ko talaashte hain, aur unhe aage badhne ke liye poora educational support dete hain.',
    'hero_tagline' => 'Building futures through education',
    'gallery_heading' => 'Celebrating talent, effort and progress.',
    'gallery_intro' => 'A glimpse into our recognition programmes, student achievements and community learning experiences across Bihar.'
];

$galleryItems = [
    ['title' => 'Recognition Day', 'subtitle' => 'Students honoured for dedication and excellence', 'image_url' => './assets/founder award  (1).jpeg', 'featured' => 1],
    ['title' => 'Talent Hunt', 'subtitle' => 'Encouraging brilliant minds', 'image_url' => './assets/founder award  (2).jpeg', 'featured' => 0],
    ['title' => 'Learning Support', 'subtitle' => 'Helping young learners move forward', 'image_url' => './assets/founder award  (3).jpeg', 'featured' => 0],
    ['title' => 'Community Celebration', 'subtitle' => 'Shared success with families and schools', 'image_url' => './assets/founder award  (4).jpeg', 'featured' => 1],
    ['title' => 'Education for All', 'subtitle' => 'Building opportunity through guidance', 'image_url' => './assets/founder award  (1).jpeg', 'featured' => 0],
    ['title' => 'Growth Journey', 'subtitle' => 'Each achievement sparks a bigger dream', 'image_url' => './assets/founder award  (2).jpeg', 'featured' => 0],
];

$pageTitle = $settings['site_title'];
$currentPage = 'index.php';
include __DIR__ . '/partials/header.php';
?>

<section class="hero">
  <div class="hero-copy">
    <div class="eyebrow-block">
      <p class="eyebrow"><?= htmlspecialchars($settings['hero_tagline'] ?? SITE_DEFAULTS['hero_tagline']) ?></p>
    </div>
    <h1><?= htmlspecialchars($settings['home_title'] ?? SITE_DEFAULTS['home_title']) ?></h1>
    <p class="hero-text"><?= htmlspecialchars($settings['home_subtitle'] ?? SITE_DEFAULTS['home_subtitle']) ?></p>
    <div class="hero-actions">
      <a class="button" href="./awards.html">Explore our awards</a>
      <a class="text-link" href="./about.html">Know our story <span>→</span></a>
    </div>
  </div>
  <div class="hero-media">
    <img src="./assets/founder award  (1).jpeg" alt="Students receiving recognition">
    <div class="hero-stamp">
      <b>Since<br>2017</b>
      <span>Education<br>for all</span>
    </div>
  </div>
</section>

<section class="intro section-shell">
  <div class="intro-image image-frame">
    <img src="./assets/founder award  (2).jpeg" alt="Award ceremony">
  </div>
  <div class="intro-copy">
    <div class="eyebrow-block">
      <p class="eyebrow">About the council</p>
    </div>
    <h2>Bihar ke students ka potential progress mein transform hona chahiye.</h2>
    <p>Our council works to discover hidden academic talent and provide the encouragement, recognition and guidance students need to move forward with confidence.</p>
    <a class="button outline" href="./about.html">Read more about us</a>
  </div>
</section>

<section class="work-section" id="initiatives">
  <div class="section-shell section-heading">
    <div>
      <p class="eyebrow">What we do</p>
      <h2>A glimpse of our work</h2>
    </div>
    <p>Our programmes place students and their aspirations at the centre of every effort.</p>
  </div>
  <div class="work-grid section-shell">
    <article class="work-card">
      <img src="./assets/founder award  (3).jpeg" alt="Students at a council programme">
      <div>
        <span>01</span>
        <h3>Talent Discovery</h3>
        <p>Academic assessments that help identify deserving and high-potential students.</p>
      </div>
    </article>
    <article class="work-card">
      <img src="./assets/founder award  (4).jpeg" alt="Award distribution programme">
      <div>
        <span>02</span>
        <h3>Scholarships &amp; Awards</h3>
        <p>Recognition, certificates and financial support for continued learning.</p>
      </div>
    </article>
    <article class="work-card">
      <img src="./assets/founder award  (1).jpeg" alt="Students being honoured">
      <div>
        <span>03</span>
        <h3>Educational Support</h3>
        <p>Practical learning essentials and guidance for a brighter future.</p>
      </div>
    </article>
    <article class="work-card">
      <img src="./assets/founder award  (2).jpeg" alt="Council community event">
      <div>
        <span>04</span>
        <h3>Community Outreach</h3>
        <p>Working with families and schools so every learner can progress.</p>
      </div>
    </article>
  </div>
</section>

<section class="recognition section-shell">
  <div>
    <p class="eyebrow">Celebrate achievement</p>
    <h2>Recognition that motivates students to go further.</h2>
    <p>From district toppers to committed young learners, our awards celebrate effort and inspire the next milestone.</p>
    <a class="button" href="./awards.html">View awards &amp; recognition</a>
  </div>
  <figure>
    <img src="./assets/founder award  (4).jpeg" alt="Students at an award ceremony">
    <figcaption>
      <b>100,000+</b>
      <span>students and families reached through educational support</span>
    </figcaption>
  </figure>
</section>

<section class="gallery-section section-shell" id="gallery">
  <div class="section-heading">
    <div>
      <p class="eyebrow">Our gallery</p>
      <h2><?= htmlspecialchars($settings['gallery_heading'] ?? SITE_DEFAULTS['gallery_heading']) ?></h2>
    </div>
    <p><?= htmlspecialchars($settings['gallery_intro'] ?? SITE_DEFAULTS['gallery_intro']) ?></p>
  </div>
  <div class="gallery-grid">
    <?php foreach ($galleryItems as $index => $item): ?>
      <img src="<?= htmlspecialchars($item['image_url'] ?? './assets/founder award  (1).jpeg') ?>" alt="<?= htmlspecialchars($item['title'] ?? 'Gallery image') ?>" <?= $index === 0 ? 'class="featured-gallery"' : '' ?>>
    <?php endforeach; ?>
  </div>
</section>

<section class="join-section">
  <div class="section-shell">
    <p class="eyebrow">Be part of change</p>
    <h2>Join us in creating more opportunity for every learner in Bihar.</h2>
    <a class="button light" href="./form.html">Apply now</a>
  </div>
</section>

<?php include __DIR__ . '/partials/footer.php'; ?>
