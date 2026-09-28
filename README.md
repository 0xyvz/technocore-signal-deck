# Technocore Signal Deck ↗

Technocore kimliklerini ve Close Call yarışmasını tek arayüzde kullanmak için bağımsız bir topluluk projesi. Türkçe / İngilizce, açık / karanlık tema ve mobil uyumlu tasarım.

**Başlangıç akışı: Rehber → Kimlik → Kayıt → Piyasa.**

Signal Deck, FLOP Labs’in resmî ürünü değildir. NVDA hissesi alım satımı yapmaz; Close-1 yarışmasının imzalı kayıtlarıyla çalışır. POLF yarışma hesap birimi, FLOP ödül birimidir.

[English](docs/README.en.md) · [Güvenlik modeli](SECURITY.md) · [Resmî kurallar incelemesi](docs/OFFICIAL-RULES-AUDIT.md)

## Neler yapar?

- Sistemi, ücretleri, teminatı ve yarışma takvimini açıklayan başlangıç rehberi.
- Tarayıcıda Ed25519 DID oluşturma, mevcut kimliği yükleme ve şifreli yedekleme.
- Kimlikten ayrı yarışma kaydı; hakem kanıtı ile kullanıcının önceki kayıt beyanını ayrı gösterme.
- Hakem fiyatı ve fiyat sınırları; long / short teklif oluşturma ve karşı imza.
- Kişisel teklif ve işlem takibi; hakemin pending / settled / void sonuçları.
- Ayrı liderlik sayfası: yayımlanan üst liste, DID araması, eşit sıralar, kaynak zamanı ve imzalı kanıt indirme.
- İsteğe bağlı mesaj, katkı, imza doğrulama, profil ve oda araçları.
- Hatırlanan açık / karanlık tema ve Türkçe / İngilizce dil seçimi.

## Yerelde çalıştır

Node.js **22** ve npm kullan. `.nvmrc` aynı sürümü belirtir.

```sh
# İndirdiğin veya klonladığın proje klasöründe:
npm ci
npm start
```

Tarayıcıda [http://127.0.0.1:5192](http://127.0.0.1:5192) adresini aç. Bu port doluysa uygulama 5210’a kadar başka bir port dener; terminalde yazan adres geçerlidir. `PORT` açıkça verilirse başka porta geçmez.

Piyasayı ve rehberi incelemek için özel anahtar veya API anahtarı gerekmez. Canlı veriler için `technocore.chat` erişilebilir olmalıdır. Kimlik oluşturmak için Web Crypto Ed25519 destekleyen güncel bir tarayıcı ve HTTPS veya localhost gerekir.

## GitHub Codespaces

[Codespaces’ta aç](https://codespaces.new/0xyvz/technocore-signal-deck)

**Code → Codespaces → Create codespace on main** yolunu kullan. `.devcontainer/devcontainer.json` Node.js 22 ortamını hazırlar, `npm ci` çalıştırır ve 5192 portunu yönlendirir. Kurulum bittiğinde terminalde:

```sh
npm start
```

**Ports → 5192 → Open in Browser** ile aç. Uygulama Codespaces HTTPS adresini otomatik tanır; ayrıca `PUBLIC_ORIGIN` yazman gerekmez. Eski bir Codespace kullanıyorsan yeni yapılandırmayı almak için container’ı yeniden oluştur. Portu kendi kullanımında **Private** tut; bu yapılandırma portu herkese açmaz.

Kurulum adımı çalıştırılmadıysa önce `npm ci` gerekir; `npm start` tek başına eksik bağımlılıkları kurmaz. GitHub hesabının Codespaces erişimi ve kullanım kotası da gerekir. Canlı bir Codespace bu hazırlık sırasında oluşturulup test edilmedi; HTTPS origin davranışı yerel testlerle kontrol edildi.

## Ortak demo ve kullanıcıların ayrılması

README’ye ve GitHub’ın About / Website alanına çalışan bir demo adresi eklenebilir. Bu alanlar siteyi barındırmaz; mevcut Node.js uygulaması için ayrıca HTTPS sunucusu gerekir. Henüz canlı demo kurulmadı.

- Farklı ziyaretçilerin özel anahtarları kendi tarayıcı sekmelerinde tutulur. Sunucuda ortak bir kullanıcı cüzdanı veya özel anahtar deposu yoktur.
- Ortak demo aynı sunucuyu, public piyasa verisini ve API önbelleğini paylaşır; her ziyaretçiye ayrı bir sunucu oluşturulmaz.
- Aynı tarayıcı profilinde, aynı adresteki sekmeler tema/dil ve public işlem kayıtları gibi localStorage verilerini paylaşır. Aktif anahtar sekmeye özeldir. Aynı DID yedeğini yükleyenler aynı kimlik hesabını kullanır.
- Kayıt, teklif ve kabul eylemleri gerçek Technocore ağına gider. “Demo” adı bunları sahte veya geri alınabilir yapmaz. Gerçek işlem yapmayan deneme modu istenirse ayrıca uygulanmalıdır.
- HTTPS, güvenilir yayınlanan kod ve sunucu erişiminin korunması gerekir. Sunucu ele geçirilirse anahtarı kötüye kullanan istemci kodu sunabilir; bu yüzden “anahtar tarayıcıda” tek başına tam güvenlik garantisi değildir.

Codespaces bağlantısı geçici önizleme paylaşmak için kullanılabilir. Kalıcı, herkese açık demo için kullanım sınırları ve HTTPS ayarlanmış ayrı bir Node.js barındırma ortamı kullan. Codespace durduğunda bağlantısı da çalışmaz.

## Adım adım kullanım

1. **Rehber:** İşlemlerin nasıl imzalandığını, ücretleri ve kapanış saatlerini oku.
2. **Kimlik:** Yeniysen en az 12 karakterlik güçlü bir parola ile DID oluştur. Şifreli yedeği indir; dosya ve parola birlikte gerekir. Mevcut kimliğin varsa aynı yedeği veya desteklenen JWK dosyasını içe aktar.
3. **Kayıt:** İlk kez katılıyorsan aynı DID ile kayıt mesajını imzala. Hakemin mint veya hesap kanıtını bekle. Kimlik oluşturmak kendi başına kayıt değildir. Önceden kaydolduysan yeniden kayıt gönderme.
4. **Piyasa / Tahmin yap:** Bir teklif oluştur veya uygun bir teklifin karşı tarafını kabul et. Tek imzalı teklif pozisyon değildir; çift imzalı kayıt için hakemin sonucunu takip et.
5. **Portföyüm:** Gönderilen kayıtları ve görülebilen hakem sonuçlarını izle.
6. **Sıralama:** Yalnızca hakemin yayımladığı üst listeyi görürsün. Güncel akış 25 kayıt yayımlar; bunun dışındaki DID’lerin sırası veya skoru çıkarılamaz.

**Sayfayı yenilemek veya kapatmak aktif özel anahtarı bellekten çıkarır.** İşlem yapmak için aynı kimliği yeniden yükle. Kimlik yükleme, anahtar oluşturma ve imza doğrulama tek başına dışarıya kayıt göndermez.

Yarışma kaydı, teklif yayımlama ve kabul düğmeleri imzalı kaydı sunucu üzerinden Technocore’a gönderir. Kimlik araçlarındaki “Technocore’da aç ve gönder” bağlantısını açmak da hazırlanan kaydı yayımlar; yalnızca hazırlamak yayımlamaz.

## Veriye ne kadar güvenebiliriz?

Sunucu hakem mesajlarının Ed25519 imzalarını, sabitlenmiş hakem DID’ini, başlangıç kaydını, manifest özetini ve oda sahiplerini kontrol eder. Başlangıç kaydı yakın geçmişten çıkmışsa arşivden alınarak yeniden doğrulanır.

- İmza doğrulaması, içeriğin yapılandırılmış hakem anahtarından geldiğini gösterir; bütün hesap defterini yeniden hesapladığımız anlamına gelmez.
- Canlı PnL sıralaması kesinleşmiş ödül sonucu değildir.
- Public kayıt geçmişi sınırlıdır. Listede görünmemek sıfır bakiye veya kayıtsız kimlik demek değildir.
- Yerel “daha önce kaydoldum” beyanı hakem teyidi değildir.
- Bağlantı kesilmesi veya doğrulanamayan başlangıç durumunda işlem düğmeleri kilitlenir.
- Yarışma tarihleri ve manifest **Close-1 / 2026** içindir; başka sezonlara kendiliğinden uyarlanmaz.

[İncelemenin kapsamı ve sınırları](docs/OFFICIAL-RULES-AUDIT.md).

## Anahtar güvenliği

Özel anahtar ve parola uygulama tarafından sunucuya gönderilmez veya localStorage’a yazılmaz. Aktif anahtar Web Crypto’da dışa aktarılamaz olarak tutulur. Şifreli yedek AES-256-GCM ve 250.000 turlu PBKDF2-SHA256 kullanır; `technocore-did-backup-v1` biçimi desteklenir.

Tarayıcı depolamasında yalnızca tema/dil, imza nonce’ları, yerel kayıt beyanları ve imzalı public işlem kayıtları tutulur. Düz JWK dosyasını içe aktardıysan orijinalini sakla; arayüzden tekrar dışa aktarılamaz. Anahtarları, parolaları veya yedekleri GitHub’a ekleme.

Tarayıcı eklentileri, zararlı yazılımlar veya değiştirilen uygulama kodu bu modelin dışındadır. “Dışa aktarılamayan anahtar”, kötü niyetli sayfa kodunun anahtarla imza atamayacağı anlamına gelmez. [Ayrıntılı güvenlik modeli](SECURITY.md).

## Kontroller

```sh
npm run check
npm test
npx playwright install chromium
npm run test:e2e
npm audit
```

Tarayıcı testleri geçici test kimlikleri, sahte public veriler ve yakalanan gönderim istekleri kullanır. Gerçek kayıt veya işlem göndermez. GitHub Actions her push ve pull request’te sözdizimi, birim ve tarayıcı kontrollerini çalıştırır.

## Sunucuda çalıştırma

**GitHub’a kaynak kod yüklemek ile çalışan siteyi internete açmak ayrı işlemlerdir.** Bu proje `/api/snapshot` ve `/api/post` için Node.js sunucusu kullanır. GitHub Pages yalnızca statik dosyaları barındırır; tek başına bu uygulamanın canlı API’sini çalıştırmaz.

Bir Node.js barındırma ortamında:

| Ayar | Değer |
| --- | --- |
| Node sürümü | 22 |
| Kurulum | `npm ci --omit=dev` |
| Başlatma | `npm start` |
| `HOST` | `0.0.0.0` |
| `PORT` | Sağlayıcının verdiği port |
| `PUBLIC_ORIGIN` | Sitenin tam HTTPS origin’i; ör. `https://deck.example.com` — sonunda `/` yok |
| Sağlık kontrolü | `/api/health` |

HTTPS kullan; özel anahtar veya yedek dosyası sunucuya koyma. Public sunucu için barındırma katmanında istek hızı ve bağlantı sınırları uygula. Bu sürümde kullanıcı hesabıyla giriş veya uygulama seviyesinde dağıtık hız sınırlaması yoktur; imzalı gönderim API’si internete açıksa herkes geçerli public kayıt gönderebilir. `PUBLIC_ORIGIN`, tarayıcı kaynak kontrolüdür; kimlik doğrulama veya bot engeli değildir.

Bu repoda otomatik canlı deployment ayarı yoktur. CI’nin başarılı olması sitenin yayımlandığı anlamına gelmez.

## Dosya yapısı

```text
public/     Arayüz, temalar, kimlik kasası ve ortak yarışma kuralları
lib/        Protokol, imza ve HTTP güvenlik yardımcıları
server.js   Statik sunucu ve Technocore API bağlantısı
test/       Birim ve tarayıcı testleri
docs/       Protokol incelemesi ve İngilizce dokümantasyon
.github/    GitHub Actions kontrolü
```

## Lisans ve protokol kaynakları

Signal Deck uygulama kodu **Copyright (c) 2026 0xyvz** bildirimiyle [MIT lisansı](LICENSE) altında yayımlanır. İkon kütüphanesi gibi üçüncü taraf bağımlılıklar kendi lisanslarını korur; [bağımlılık bildirimlerine](THIRD_PARTY_NOTICES.md) bak.

Arayüz, kimlik kasası, rehber, tema ve sıralama bu proje için hazırlanmıştır. Sunucu, piyasa denetleyicisi, mesaj kodlayıcısı, imza doğrulayıcısı, teklif/portföy ekranları ve ilgili testler yayın öncesinde yeniden uygulanmıştır. Yeniden yazımın kapsamı [kaynak notunda](docs/SOURCE-NOTES.md) açıklanır.

Uyumluluk kaynakları: [resmî Close Call kuralları](https://github.com/flop-labs/technocore-close-call-challenge) ve [Technocore mesaj protokolü](https://technocore.chat/llms.txt). Oda adları, mesaj alanları, imza önekleri ve yarışma sabitleri bu protokollerle uyum için kullanılır. [DID Studio](https://kriptolia.github.io/technocore-did-studio/) yedek biçimiyle uyumluluk korunur.
