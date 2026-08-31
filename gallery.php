<?php

declare(strict_types=1);

$settings = [
    'site_title' => 'Bihar State Educational Development & Research Council',
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
    ['title' => 'Motivating Future Leaders', 'subtitle' => 'Celebrating perseverance and promise', 'image_url' => './assets/founder award  (3).jpeg', 'featured' => 0],
    ['title' => 'Progress in Motion', 'subtitle' => 'From talent to transformation', 'image_url' => './assets/founder award  (4).jpeg', 'featured' => 0],
];

$pageTitle = 'Gallery | ' . $settings['site_title'];
$currentPage = 'gallery.php';
include __DIR__ . '/partials/header.php';
?>

<section class="page-hero gallery-hero">
  <div class="section-shell">
    <p class="eyebrow">Moments of impact</p>
    <h1>Gallery</h1>
    <p><?= htmlspecialchars($settings['gallery_intro'] ?? SITE_DEFAULTS['gallery_intro']) ?></p>
  </div>
</section>

<section class="section-shell gallery-page">
  <div class="gallery-toolbar">
    <div>
      <p class="eyebrow">Our memories</p>
      <h2><?= htmlspecialchars($settings['gallery_heading'] ?? SITE_DEFAULTS['gallery_heading']) ?></h2>
    </div>
    <a class="button outline" href="./contact.html">Connect with us</a>
  </div>

  <div class="gallery-layout">
    <?php foreach ($galleryItems as $index => $item): ?>
      <?php
        $classes = ['gallery-item'];
        if (($item['featured'] ?? 0) == 1) { $classes[] = 'featured'; }
        if ($index === 3) { $classes[] = 'wide'; }
        if ($index === 6) { $classes[] = 'tall'; }
      ?>
      <figure class="<?= implode(' ', $classes) ?>">
        <img src="<?= htmlspecialchars($item['image_url'] ?? './assets/founder award  (1).jpeg') ?>" alt="<?= htmlspecialchars($item['title'] ?? 'Gallery image') ?>">
        <figcaption>
          <strong><?= htmlspecialchars($item['title'] ?? 'Gallery item') ?></strong>
          <span><?= htmlspecialchars($item['subtitle'] ?? '') ?></span>
        </figcaption>
      </figure>
    <?php endforeach; ?>
  </div>
</section>

<?php include __DIR__ . '/partials/footer.php'; ?>
