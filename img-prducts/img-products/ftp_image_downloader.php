<?php
/**
 * FTP PRODUKTBILDER-DOWNLOADER
 * Lädt automatisch nur die benötigten Bilder von deinem FTP-Server herunter
 */

// ========================================
// KONFIGURATION - Hier deine Daten eintragen
// ========================================
$ftp_server = '';  // z.B. 'ftp.example.com'
$ftp_port = 21;
$ftp_username = '';
$ftp_password = '';
$excel_file = 'Producte-Hoiss-Stickerei.xlsx';
$image_folder = 'img-products';
$ftp_base_path = '/picture_db';  // Basispfad auf dem FTP-Server

// ========================================
// SCRIPT START
// ========================================
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FTP Bilder-Downloader</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #ef8006;
            border-bottom: 3px solid #ef8006;
            padding-bottom: 10px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #333;
        }
        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
        }
        button {
            background: #ef8006;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
        }
        button:hover {
            background: #cc6f05;
        }
        .log {
            background: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #ef8006;
            margin: 20px 0;
            font-family: monospace;
            font-size: 13px;
            max-height: 500px;
            overflow-y: auto;
        }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .info { color: #17a2b8; }
        .warning { color: #ffc107; }
        .summary {
            background: #e8f4f8;
            padding: 20px;
            border-radius: 6px;
            margin-top: 20px;
        }
        .summary h3 {
            margin-top: 0;
            color: #ef8006;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🖼️ FTP Produktbilder-Downloader</h1>

        <?php if ($_SERVER['REQUEST_METHOD'] !== 'POST'): ?>

        <!-- FORMULAR -->
        <form method="POST">
            <div class="form-group">
                <label>FTP-Server:</label>
                <input type="text" name="ftp_server" placeholder="ftp.example.com" required>
            </div>

            <div class="form-group">
                <label>FTP-Port:</label>
                <input type="number" name="ftp_port" value="21" required>
            </div>

            <div class="form-group">
                <label>Benutzername:</label>
                <input type="text" name="ftp_username" required>
            </div>

            <div class="form-group">
                <label>Passwort:</label>
                <input type="password" name="ftp_password" required>
            </div>

            <button type="submit">📥 Download starten</button>
        </form>

        <?php else: 
            // DOWNLOAD PROZESS
            $ftp_server = $_POST['ftp_server'];
            $ftp_port = intval($_POST['ftp_port']);
            $ftp_username = $_POST['ftp_username'];
            $ftp_password = $_POST['ftp_password'];

            echo '<div class="log">';

            // Statistik
            $stats = ['success' => 0, 'skipped' => 0, 'error' => 0];

            // 1. Excel-Datei lesen
            echo '<p class="info">📄 Lese Excel-Datei: ' . htmlspecialchars($excel_file) . '</p>';

            if (!file_exists($excel_file)) {
                echo '<p class="error">❌ Excel-Datei nicht gefunden!</p>';
                echo '</div></div></body></html>';
                exit;
            }

            // SimpleXLSX Klasse einbinden (ohne externe Bibliotheken)
            require_once 'simple_xlsx_reader.php';

            // Alternative: CSV-Export aus Excel verwenden
            echo '<p class="warning">⚠️ HINWEIS: Bitte exportiere die Excel-Datei als CSV (Producte-Hoiss-Stickerei.csv) und lade diese Seite neu.</p>';

            // CSV-Datei lesen (einfacher ohne externe Bibliotheken)
            $csv_file = str_replace('.xlsx', '.csv', $excel_file);

            if (!file_exists($csv_file)) {
                echo '<p class="error">❌ CSV-Datei nicht gefunden. Bitte exportiere die Excel als CSV.</p>';
                echo '</div></div></body></html>';
                exit;
            }

            $images = [];
            if (($handle = fopen($csv_file, 'r')) !== FALSE) {
                $header = fgetcsv($handle, 1000, ';'); // Erste Zeile = Kopfzeilen

                // Finde Packshot-Spalte
                $packshot_index = array_search('Packshot', $header);

                if ($packshot_index === false) {
                    echo '<p class="error">❌ Spalte "Packshot" nicht gefunden!</p>';
                    echo '</div></div></body></html>';
                    exit;
                }

                while (($row = fgetcsv($handle, 1000, ';')) !== FALSE) {
                    if (isset($row[$packshot_index]) && !empty($row[$packshot_index])) {
                        $images[] = $row[$packshot_index];
                    }
                }
                fclose($handle);
            }

            $images = array_unique($images);
            echo '<p class="success">✅ ' . count($images) . ' eindeutige Bilder gefunden</p>';

            // 2. Bild-Ordner erstellen
            if (!is_dir($image_folder)) {
                mkdir($image_folder, 0755, true);
                echo '<p class="info">📁 Ordner erstellt: ' . htmlspecialchars($image_folder) . '</p>';
            }

            // 3. FTP-Verbindung
            echo '<p class="info">🌐 Verbinde mit FTP-Server: ' . htmlspecialchars($ftp_server) . ':' . $ftp_port . '</p>';

            $ftp_conn = ftp_connect($ftp_server, $ftp_port, 30);

            if (!$ftp_conn) {
                echo '<p class="error">❌ FTP-Verbindung fehlgeschlagen!</p>';
                echo '</div></div></body></html>';
                exit;
            }

            if (!ftp_login($ftp_conn, $ftp_username, $ftp_password)) {
                echo '<p class="error">❌ FTP-Login fehlgeschlagen!</p>';
                ftp_close($ftp_conn);
                echo '</div></div></body></html>';
                exit;
            }

            ftp_pasv($ftp_conn, true);
            echo '<p class="success">✅ Erfolgreich verbunden als ' . htmlspecialchars($ftp_username) . '</p>';
            echo '<hr>';

            // 4. Bilder herunterladen
            $counter = 1;
            foreach ($images as $image_filename) {
                $local_path = $image_folder . '/' . $image_filename;

                // Überspringe wenn bereits vorhanden
                if (file_exists($local_path)) {
                    echo '<p class="warning">[' . $counter . '/' . count($images) . '] ⏭️ Überspringe (existiert bereits): ' . htmlspecialchars($image_filename) . '</p>';
                    $stats['skipped']++;
                    $counter++;
                    continue;
                }

                // Extrahiere GUID aus Dateinamen (z.B. "47BD0EE3-BCA7-43C0-8D05-7D3D2D502F86.jpg")
                $guid = pathinfo($image_filename, PATHINFO_FILENAME);

                // FTP-Pfad: /picture_db/{GUID}/Lizenzfrei_72dpi/{DATEINAME}
                $ftp_path = $ftp_base_path . '/' . $guid . '/Lizenzfrei_72dpi/' . $image_filename;

                echo '<p class="info">[' . $counter . '/' . count($images) . '] ⬇️ Lade herunter: ' . htmlspecialchars($image_filename) . '</p>';
                echo '<p style="margin-left: 20px; color: #666;">FTP-Pfad: ' . htmlspecialchars($ftp_path) . '</p>';

                // Download
                if (ftp_get($ftp_conn, $local_path, $ftp_path, FTP_BINARY)) {
                    $size = filesize($local_path);
                    $size_kb = round($size / 1024, 1);
                    echo '<p class="success" style="margin-left: 20px;">✅ Erfolgreich (' . $size_kb . ' KB)</p>';
                    $stats['success']++;
                } else {
                    echo '<p class="error" style="margin-left: 20px;">❌ Download fehlgeschlagen</p>';
                    $stats['error']++;
                }

                $counter++;
                flush();
                ob_flush();
            }

            // 5. FTP-Verbindung schließen
            ftp_close($ftp_conn);

            echo '</div>';

            // Zusammenfassung
            echo '<div class="summary">';
            echo '<h3>📊 ZUSAMMENFASSUNG</h3>';
            echo '<p><strong>✅ Erfolgreich heruntergeladen:</strong> ' . $stats['success'] . '</p>';
            echo '<p><strong>⏭️ Übersprungen (bereits vorhanden):</strong> ' . $stats['skipped'] . '</p>';
            echo '<p><strong>❌ Fehler:</strong> ' . $stats['error'] . '</p>';
            echo '<p><strong>📁 Gespeichert in:</strong> ' . realpath($image_folder) . '</p>';
            echo '</div>';

            echo '<br><a href="' . $_SERVER['PHP_SELF'] . '"><button>🔄 Erneut ausführen</button></a>';
        endif; ?>

    </div>
</body>
</html>
