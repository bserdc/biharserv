<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

function getPdo(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_NAME);

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        throw new RuntimeException('Database connection failed: ' . $e->getMessage());
    }

    return $pdo;
}

function ensureSiteSchema(PDO $pdo): void
{
    $pdo->exec(<<<'SQL'
        CREATE TABLE IF NOT EXISTS site_settings (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            key_name VARCHAR(100) NOT NULL UNIQUE,
            value_text TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    SQL);

    $pdo->exec(<<<'SQL'
        CREATE TABLE IF NOT EXISTS gallery_items (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(120) NOT NULL,
            subtitle VARCHAR(180) DEFAULT NULL,
            image_url VARCHAR(255) NOT NULL,
            featured TINYINT(1) NOT NULL DEFAULT 0,
            sort_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    SQL);

    $settings = [
        'site_title' => 'Bihar State Educational Development & Research Council',
        'home_title' => 'Har talent ko milni chahiye opportunity to shine.',
        'home_subtitle' => 'Hum exams aur sahi pehchaan ke zariye Bihar ke honhaar students ko talaashte hain, aur unhe aage badhne ke liye poora educational support dete hain.',
        'hero_tagline' => 'Building futures through education',
        'report_bar' => 'फाउंडेशन में डाटा एंट्री ऑपरेटर के पदों पर जल्द आ रही है नई भर्ती, अपनी तैयारी पूरी रखें!',
        'gallery_heading' => 'Celebrating talent, effort and progress.',
        'gallery_intro' => 'A glimpse into our recognition programmes, student achievements and community learning experiences across Bihar.'
    ];

    $stmt = $pdo->prepare('INSERT INTO site_settings (key_name, value_text) VALUES (:key_name, :value_text) ON DUPLICATE KEY UPDATE value_text = VALUES(value_text)');
    foreach ($settings as $key => $value) {
        $stmt->execute([':key_name' => $key, ':value_text' => $value]);
    }

    $defaultGallery = [
        ['Recognition Day', 'Students honoured for dedication and excellence', './assets/founder award  (1).jpeg', 1, 1],
        ['Talent Hunt', 'Encouraging brilliant minds', './assets/founder award  (2).jpeg', 0, 2],
        ['Learning Support', 'Helping young learners move forward', './assets/founder award  (3).jpeg', 0, 3],
        ['Community Celebration', 'Shared success with families and schools', './assets/founder award  (4).jpeg', 1, 4],
        ['Education for All', 'Building opportunity through guidance', './assets/founder award  (1).jpeg', 0, 5],
        ['Growth Journey', 'Each achievement sparks a bigger dream', './assets/founder award  (2).jpeg', 0, 6],
        ['Motivating Future Leaders', 'Celebrating perseverance and promise', './assets/founder award  (3).jpeg', 0, 7],
        ['Progress in Motion', 'From talent to transformation', './assets/founder award  (4).jpeg', 0, 8]
    ];

    $count = (int)$pdo->query('SELECT COUNT(*) FROM gallery_items')->fetchColumn();
    if ($count === 0) {
        $insert = $pdo->prepare('INSERT INTO gallery_items (title, subtitle, image_url, featured, sort_order) VALUES (:title, :subtitle, :image_url, :featured, :sort_order)');
        foreach ($defaultGallery as $item) {
            $insert->execute([
                ':title' => $item[0],
                ':subtitle' => $item[1],
                ':image_url' => $item[2],
                ':featured' => $item[3],
                ':sort_order' => $item[4],
            ]);
        }
    }
}

function getSiteSettings(PDO $pdo): array
{
    $rows = $pdo->query('SELECT key_name, value_text FROM site_settings')->fetchAll();
    $settings = [];
    foreach ($rows as $row) {
        $settings[$row['key_name']] = $row['value_text'];
    }
    return $settings + SITE_DEFAULTS;
}

function getGalleryItems(PDO $pdo, int $limit = 0): array
{
    $sql = 'SELECT * FROM gallery_items ORDER BY featured DESC, sort_order ASC';
    if ($limit > 0) {
        $sql .= ' LIMIT ' . (int)$limit;
    }

    return $pdo->query($sql)->fetchAll();
}
