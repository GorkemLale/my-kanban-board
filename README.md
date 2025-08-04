# Kanban Board Uygulaması

## Proje Açıklaması
Bu proje, görev yönetimi için geliştirilmiş bir Kanban Board uygulamasıdır. React frontend, MongoDB veritabanı ve Node.js backend kullanılarak geliştirilmiştir.

## Kullanılan Teknolojiler
- Frontend: React.js
- Backend: Node.js, Express
- Veritabanı: MongoDB
- Styling: CSS

## Proje Yapısı
- `client/`: React frontend uygulaması
- `server/`: Node.js backend API'si

## Projeyi başlatmak için iki ayrı terminale ihtiyacınız vardır. (biri  backend, biri frontend)

## Kurulum ve Çalıştırma
1. Backend kurulumu:
   ```bash
   cd server
   npm install  -> package.json'da tanımlı olan dependencies bölümündekileri indirir.
   npm start -> Projeyi başlatabilirsiniz
   ```

2. Frontend kurulumu:
   ```bash
   cd client
   npm install
   npm start
   ```

## API Endpoints
- GET /api/tasks/:boardId - Görevleri listele
- POST /api/tasks/:boardId - Yeni görev ekle
- PUT /api/tasks - Görev güncelle
- DELETE /api/tasks - Görev sil

## API Testleri
Proje içerisinde `postman_collection.json` dosyası bulunmaktadır. Bu dosyayı Postman'e import ederek tüm API endpoint'lerini test edebilirsiniz.

**Postman Collection Kullanımı:**

### 1. Collection'ı Import Etme
1. Postman uygulamasını açın
2. Sol üst köşedeki "Import" butonuna tıklayın
3. "Upload Files" sekmesinde `postman_collection.json` dosyasını seçin
4. "Import" butonuna tıklayın

### 2. Variable Ayarlama
1. Sol paneldeki "Kanban Board API" adlı alana tıklayın.
2. Sağ panelde çıkan "Variables Sekmesine tıklayın.
3. `baseUrl` variable'ını bulun ve şu şekilde ayarlayın:
   - **Initial Value**: `http://localhost:5000`
   - **Current Value**: `http://localhost:5000`
4. Sağ panelin hemen yukarısında yer alan "Save" butonuna tıklayın

### 3. Test Çalıştırma
1. Collection içindeki herhangi bir endpoint'e tıklayın
2. Sağ panelde "Send" butonuna basın
3. Alt panelde response'u görüntüleyin

### 4. Environment Kullanımı (Opsiyonel)
Farklı ortamlar için environment oluşturabilirsiniz:
1. Sağ üst köşede "Environment" dropdown'ına tıklayın
2. "Add" seçeneğini seçin
3. Environment adı: "Development"
4. Variable ekleyin:
   - **Variable**: `baseUrl`
   - **Initial Value**: `http://localhost:5000`
   - **Current Value**: `http://localhost:5000`
5. "Save" butonuna tıklayın

### 5. Test Sonuçları
- ✅ **200 OK**: Başarılı işlem
- ❌ **404 Not Found**: Endpoint bulunamadı
- ❌ **500 Internal Server Error**: Sunucu hatası

## Geliştirme Süreci

### Frontend Geliştirme
Önce Figma'daki tasarımı inceledim ve frontend kısmını React kullanarak geliştirdim. Component yapısı sırasıyla:
- **KanbanBoard** → **TaskList** → **TaskCard** → **Button**

Responsive tasarım ve Drag & Drop konuları karmaşıklaşınca backend geliştirmeye geçtim.

### Backend Geliştirme

#### 1. Temel Yapılandırma
İlk olarak `server.js` dosyasına Express uygulamasını oluşturdum ve `app.get('/')` test route'unu ekledim. Sonra `app.listen()` sadece `server.js`'te kaldı ve ana sayfa (test route) `app.js`'e taşındı. `app.js` export edilip `server.js`'e import edilerek kullanıldı.

#### 2. Middleware Yapılandırması
`app.js`'te aşağıdaki middleware'leri ekledim:
- `app.use(express.json())` - JSON parsing
- `app.use(express.urlencoded({ extended: true }))` - URL-encoded parsing  
- `app.use(cors())` - Cross-Origin Resource Sharing

**Önemli Not:** Middleware'lerin route'lardan önce tanımlanması gerekiyor. Aksi takdirde `express.json()` için problem olur, `morgan` için sadece terminalde istek görmeyiz.

#### 3. Veritabanı Modelleri
MongoDB için `Board.js` ve `Task.js` şemalarını oluşturdum. Her collection için MongoDB arka planda ID tutar, ama board için özel bir ID tutuyoruz ki board'u görüntüleyebilmek için URL'de daha okunaklı bir şey kullanabilelim.

#### 4. Route Yapısı
`routes/` klasörü altında `boards.js` ve `tasks.js` dosyalarını oluşturdum. Bu route'ları `app.js`'e import edip kullandım. Route'ları middleware'lerden sonra tanımladım çünkü bu önemli - `app.use('/api/boards', boardRoutes)` gibi.

#### 5. Controller ve Business Logic
Route'lar içinde board için CRUD işlemlerindeki business logic'leri tanımladım. Rastgele ID üretimi için fonksiyon oluşturdum. İşimiz bitince bu fonksiyonu `utils/` klasörüne taşıyıp export edip import edeceğiz.

Ayrıca her route method'unun business logic'ini de controller altına taşıyacağız.

#### 6. API Testleri
Her route için her endpoint için yazılan methodların testini Postman programıyla kontrolünü gerçekleştirdim. Tüm CRUD işlemleri başarıyla test edildi ve doğru çalıştığı doğrulandı. 
