# GitHub’a yükleme rehberi

Repo adı: **technocore-signal-deck**. Görünürlük: **Public**.

Public repoya yüklenen kodu herkes okuyabilir. Hazırlanan kaynak dosyalarını yükle; `node_modules`, `.env`, kimlik dosyaları, şifreli yedekler ve test çıktıları dahil edilmez. `.gitignore` bu dosyaların yaygın biçimlerini dışarıda bırakır.

## 1. GitHub’da boş repo oluştur

1. [Yeni repo sayfasını](https://github.com/new) aç ve hesabına giriş yap.
2. **Owner** alanında kendi hesabını seç.
3. **Repository name:** `technocore-signal-deck`.
4. **Description:** `Independent Technocore identity studio and Close Call workspace — TR/EN, light/dark themes.`
5. **Public** seç.
6. README, `.gitignore` ve lisans ekleme seçeneklerini boş bırak; bunlar projede hazır.
7. **Create repository** düğmesine bas.

Oluşan repo adresini kopyala. GitHub şifreni, token’ını veya özel anahtarını sohbete yazma.

## 2. Kaynak dosyalarını yükle

### GitHub Desktop ile

[GitHub Desktop](https://desktop.github.com/) içinde kendi hesabına giriş yap. **File → Add Local Repository** üzerinden `signal-deck` proje klasörünü seç. `.github` klasörü dahil kaynak dosyalarını kontrol et, bir ilk commit oluştur. Boş repoyu önceden oluşturduysan **Repository Settings → Remote** alanına repo HTTPS adresini yaz; ardından **Push origin** kullan.

Repo henüz oluşturulmadıysa yerel repo eklendikten sonra **Publish repository** kullanılabilir: adı `technocore-signal-deck` yap ve public olması için **Keep this code private** seçimini kaldır. Aynı isimde ikinci bir repo oluşturmaya çalışma.

### Terminal ile

Aşağıdaki komutları proje klasöründe çalıştır. `GITHUB_KULLANICIN` yer tutucusunu kendi kullanıcı adınla değiştir.

```sh
git status --short
git add .devcontainer .github .gitignore .nvmrc LICENSE THIRD_PARTY_NOTICES.md README.md SECURITY.md docs lib package.json package-lock.json playwright.config.js public scripts server.js test
git diff --cached --stat
git diff --cached --check
```

Commit kimliği henüz ayarlanmadıysa yalnızca bu repo için gerçek adını veya tercih ettiğin public adını ve GitHub’ın **Settings → Emails** bölümünde verdiği noreply adresini kullan. E-posta adresi commit geçmişinde görünür.

```sh
git config user.name "GITHUB_KULLANICIN"
git config user.email "GITHUB_AYARLARINDAKI_NOREPLY_ADRESIN"
git commit -m "Initial release of Technocore Signal Deck"
git remote add origin https://github.com/GITHUB_KULLANICIN/technocore-signal-deck.git
git push -u origin main
```

`origin` zaten varsa önce `git remote -v` ile doğru repoyu gösterdiğini kontrol et; ikinci kez ekleme. İlk push için GitHub Desktop veya GitHub CLI gibi desteklenen bir oturum açma yöntemi gerekir. GitHub hesap parolası Git-over-HTTPS kimlik doğrulaması için kullanılamaz. Token’ı remote URL içine veya komut geçmişine yazma. `--force` kullanma.

## 3. Sonucu doğrula

- GitHub’da README, `public`, `server.js`, `LICENSE`, `SECURITY.md` ve `.github/workflows/ci.yml` görünüyor mu?
- **Actions → Check Signal Deck** çalışması yeşil mi?
- **Settings → Security** içinde erişebildiğin secret scanning / push protection ve Dependabot uyarılarını incele.
- Henüz canlı site kurulmadıysa repo açıklamasına çalışan site bağlantısı ekleme.

## 4. Çalışan siteyi açma

GitHub Pages bu Node.js API’sini çalıştırmaz. Repo yüklendikten sonra bir Node.js sunucusu seç; README’deki kurulum, HTTPS, `HOST`, `PORT` ve `PUBLIC_ORIGIN` ayarlarını uygula. Canlı kurulumun alan adı ve sağlayıcısı seçilmeden otomatik deploy ekleme.

Resmî kaynaklar: [Yerel kodu GitHub’a ekleme](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github), [GitHub Pages kapsamı](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
