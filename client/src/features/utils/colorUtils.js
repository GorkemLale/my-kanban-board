// Burada yani utils dizininde sadece pure functionlar tutulur. 
/*
pure function:
1) aynı input -> aynı output

function add(a, b) {
    return a + b;
}
add(2,3);  // Her zaman aynı değeri verir. return a + Math.random(); olsaydı pure function olmazdı.

2) Ayrıca Side Effect de barındırmazlar yani yukarıdaki add fonksiyonunda console.log("toplama yapıldı"); gibi bir şey olsaydı o zaman yine pure function olmazdı.

3) external state değiştirmez. yani dışında function scope dışında let counter = 0; olasydı ve biz onu fonksiyon içinde arttırıp döndürsek de pure func olmazdı. yani
let counter = 0;
function increment() {
    counter++;
    return counter;
}
// bu pure değil. ama içine num parametresi alsa ve aldığı parametreyi arttırsa o zaman yine pure olurdu.

Özetle içinde state olan bir function'ın pure olma ihtimali yok, external state değiştirir bir kere.

*/

// import { useState } from 'react';

// // Biz bunu import edeceğiz ya fonksiyon her seferinde yeniden başlatılmayacak yani performans kaybı yok. sadece her onclick'te function call yani fonksiyonun çağrılması var. Her click'te usedColor değeri korunur yani Hook state'i korunuyor. reset color bu yeni haliyle de yeniden tanımlanır ama sadece template olarak kullanılıyor, performans kaybı azdır. Ayrıca aşağıdaki useState ile initial value atamasıyla değerler sıfırlanmaz, useState sadece ilk renderda çalışır ve sıfır değeri atar. Yani buradaki ilk renderdan (mount)'tan kasıt card değildir. sonuçta bu TaskList'in içinde ve onun bir kere mount edilmesiyle bu state'lerin hepsine sadece 1 kere inital value atanır. TaskList unmount olana kadar da initial value ataması olmaz, sadece güncellemeler olur. Yani yeni TaskCard mount oluyor ama hook'a dokunmuyor çünkü ona etkisi olsa da onun hook'u değil. Not: Hook parent component'e bağlıdır, child'a değil.
// export const useRandomColor = () => {
//     // const resetColor = () => new Array(colorPalette.length).fill(0);  // [0,0,0,0,0,0,0,0,0] diye array tanımlamak gibi. bu sayede yeni renk ekleyince array'i değiştirmemize gerek kalmayacak. 
//     const resetColorArray = new Array(colorPalette.length).fill(0);  // üsttekiyle farkı: üstteki her çağrıldığında yeni referans oluşur. Bu da sürkli state update'e sebep olduğu için performans kaybı demektir!!! Her çağırışta ram daha da allocate edilir yani. Arada donmaların sebeplerinden biri de budur. Eğer bunu yaptıysan da altta aynı referansa değer ataması yapamazsın. Yani usedColor[randomDeger] = 1 dersen 0x1000'daki verileri yani resetColorArray'ın referans verdiği adresi değiştirmiş olursun. her render'da yen
//     const [usedColor, setUsedColor] = useState(resetColorArray);   // ...resetColorArray sade başına 9 eleman (colorPalette.length) vermek demektir. useState sadece b'r paramatere alır. Bunu [...resetColorArray] şeklinde yaparsan onları diziye atar. bu da sıkıntı çıkarmaz. Burada [...resetColorArray] veya resetColorArray kullanabilirsin çünkü initial value olarak ikisi de çalışır. ama setState yapacağında [...resetColorArray] yerine resetColorArray kullanırsan React "Same reference" deyip dokunmaz. FARKLI DURUM GÖRMEK ADINA resetColorArray İLE DIRECT REFERENCE VERDİM.
//     const [colorCounter, setColorCounter] = useState(0);
    
//     const getRandomColor = () => {
//         let newColor;
//         while (true) {
//             console.log("sonsuz döngü başladddıııııııı", colorCounter, colorPalette.length);  // sayıları 9, 9 basmasına rağmen state güncellenmediği için sonsuz döngüde kalıyordu!
//             const randomDeger = Math.floor(Math.random() * colorPalette.length);
//             newColor = (colorPalette[randomDeger]);
//             // console.log(`yeni renk: ${newColor}`);
//             // console.log(randomDeger, colorCounter);
//             // console.log(usedColor);
//             if (usedColor[randomDeger] === 0) {
//                 // usedColor[randomDeger] = 1;  // direkt mutation yapamazsın!!! yukarıda resetColorArray'in tanımlandığı yerde sebebini anlattım.
//                 setUsedColor(prev => {
//                     const newArray = [...prev];  // bunlar yerine yani prev yerine direkt üstümüzdeki if içinde const newArray[...usedColor]; newArray[randomDeger] = 1; setUsedArray([...newArray]); de yapapilirdik.
//                     newArray[randomDeger] = 1;
//                     return newArray;
//                 });  // Bu yaptığımızla adres düzenli olarak değişse bile önceki adres salınır. Yani: usedColor = [0,1,0,0,0,0,0,0,0] ve 0x2000, tekrar function call olur ve yukarıdaki işlemler tekrarlanır, usedColor = [1,1,0,0,0,0,0,0,0] ve 0x3000. ama artık 0x2000 değeri işaretlenmiyor ve boş sayılır.
//                 setColorCounter(colorCounter + 1);  // her türlü break edeceği için prev kullanmaya gerek yok çünkü zaten render bitince set oluyor diye bir şey hatırlıyorum.
//                 break;
//             } else {
//                 if (colorCounter >= colorPalette.length) {  // 9'dan büyük eşittir yaptık çünkü güvenlik için. olur da 9'u anlık geçip de 10 olursa diye yaptık.
//                     setColorCounter(0);
//                     setUsedColor([...resetColorArray]);  // Tek tek [0,0,0,0,0,0,0,0,0] yazmamak için ayrıca sadece renk eklediğimizde diğer değişikliklere gerek kalmayacak ve her şey otomatik olarak halledilecek.
//                     // Eğer sonrasında işlem yapmazsak state güncellenmediğinden while içinde sosnuz döngüye girer. bu yüzden bu else içindeki if'i direkt dışarı ve while'ın başına if diye alabilirdim ve while scope'a girmeden return edebilirdim ama yapmayacağım. Çünkü muazzam bir fikrim var: başından beri neden state kullanıyoruz ki? Zaten bu fonksiyonu çağırdığımızda değerini state'e setNewTaskColor(getRandomTaskColor); şeklinde atıyoruz. state'i state'lerle güncellemenin, beslemenin ne faydası var? buna react anti-pattern deniyor yani react'te yanlış kullanım demek. state'i state ile beslemek de bunlardan bir tanesi(zıttı bir durumla karşılaşırsam döneceğim bu nota! ;) )
//                     // break;  // sonsuz döngü olur yoksa
//                 }
//                 continue;
//             }
            
//         }
        
//         return newColor;
//     };
    
//     return { getRandomColor };
// };

export const colorPalette = [
        '#ad9c00ff', // papatya
        '#00A88B', // yaprak
        '#6A6DCD', // lavanta
        '#D93535', // gül
        '#C340A1', // flamingo
        '#9c27b0', // Üzüm
        '#ff9900ff', // mandalina
        '#101010ff',  // kömür
        '#307FE2'  // gökyüzü
];

// STATE KULLANMAYA GEREK YOK BU FUNCTION İÇİN. SEBEBİNİ YUKARIDAKİ FONSKİYONUN WHILE İÇİNDEKİ ELSE İÇİNDEKİ IF İÇİNDEKİ BREAK; SATIRINDA ANLATTIM.

// Öncelikle global bir color tracer tanımlıyoruz. Component dışında olduğu için her fonksiyon çağrısında tracer sıfırlanırdı. state değil ki sadece parent mount olunca sıfırlansın. Amacımız performans ve hız!!!

let usedColors = new Set();  // array gibi ama unique değerler tutar. usedColors.add(3);  // 3'ü ekler  usedColors.add(3);  // tekrar eklemez.  usedColors.has(3);  // true döndürür.  usedColors.size;  // 1 döndürür.

export const getRandomColor = () => {
    // tüm renkler kullanıldıysa reset
    if (usedColors.size >= colorPalette.length) {
        usedColors.clear();
    }

    // kullanılmamış bir renk seç, böyle yapıyoruz ki while'a gerek kalmasın. mesela 8. card'ta en kötü ihtimal denk gelebilir ve atıyorum 8 döngüden sonra bulabilir. Buna gerek kalmıyor. hatta sonlara doğru geldikçe seçeneğimiz azalıyor ve ürettiğimiz random sayı bir sonraki aşamada tanımlandığı üzere isabetli olmama ihtimali yok. çünkü availableColors.length ile üretiliyor yani sadece mevcut durumlar aralığında bir sonuç veriyor. bu da bizi diğer gereksiz if'lerden ve while'dan kurtarıyor ;) 
    const availableColors = colorPalette.filter((color, index) => 
        !usedColors.has(index)  // bu filter ile tüm colorPalette'i dolaşır ve usedColors'da has olunmayan(başında ünlem var çünkü) yani barındırmadığı değerleri döndürür ve availableColors'ın içine atar.
    );

    // random seçim
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    const selectedColor = availableColors[randomIndex];

    // şimdi ise kullandığımız rengi işaretlememiz gerekiyor ki bir dahaki gelişinde kullanmasın.
    const originalIndex = colorPalette.indexOf(selectedColor);  // seçilen rengin index'ini döndürür, biz de bunu işaretleriz ki bir daha kullanmayalım periyot bitene kadar.
    usedColors.add(originalIndex);
    
    return selectedColor;
    
};
