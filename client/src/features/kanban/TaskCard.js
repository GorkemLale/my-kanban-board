import Button from '../../components/Button/Button';
import './TaskCard.css';
import descriptionIcon from '../../assets/description-icon.png';
import { useState, useEffect, useRef } from 'react';


function TaskCard({ task, onEdit, onDelete}) {
    const [showMenu, setShowMenu] = useState(false);
    const [editData, setEditData] = useState({
        title: task.title,
        description: task.description,
        priority: task.priority,
        color: task.color
    });
    const [isClicked, setIsClicked] = useState(false);
    const [showPriorityMenu, setShowPriorityMenu] = useState(false);
    
    const titleRef = useRef(null);  // useRef de değişken saklar ama state gibi re-render olmaz. COM element referansı tutmak için kullanılır.
    const descriptionRef = useRef(null);
    
    const handleAutoResize = (textareaRef) => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    useEffect(() => {
        handleAutoResize(titleRef);
        handleAutoResize(descriptionRef);
    }, [editData.title, editData.description]);

    useEffect(() => {
        const handleDocumentClick = () => {
            setShowMenu(false);
            setIsClicked(false);
        };

        //document.addEventListener ile tüm html'ce global hale getirilir.
        document.addEventListener('click', handleDocumentClick);  // sayfadaki bütün tıklamalarda bunu çağır ve handleDocumentClick çalıştır.
        return () => document.removeEventListener('click', handleDocumentClick);  // bu da cleanup kısmı. yani component unmount olduğunda (sayfa değişimi, component conditional render ile component kaldırma {showCard && <cartcurt><cartcurt>}, parent component'ten kaldırılma (taskcard'ın parent'i task list. taskler silinince map fonskiyonunda tasks içinde bulunamadığı için kaldırılır..)) listener'ı kaldırır ki dinlemeye devam etmesin ve memory leak olmasın. sayda değişse kalmaz. sayfa değişiminde zaten tüm sayfa yenilendiği için return anlamsız olurdu. ama conditional rendering için düşününce mesela mesela task card ekledin ve sildin, bu durumda return olmazsa handleDocumentClick bellekte tutulmaya devam eder. bunu 10 tane için yapınca ise card görünmese bile hanleDocumentClick adlı fonksiyone bellekte tutulur ve meşgul eder.
    }, []);

    const handleInputChange = (editedValue, whichOne) => {  // Bu handle fonksiyon anlık değişiklikleri kayıtta tutmak içinken (yani inputtaki onChane ile çağrılırken) aşağıdaki saveAllChanges ise artık bu kaydedilmiş verilerden kaç tane varsa onları gönderip kaydetme fonksiyonudur (yani input için onkeyDown ve onBlur ile button için onClick ile çağrılır).
        setEditData(prev => {
            const newData = {...prev, [whichOne]: editedValue};
            console.log("input değiştirildi", newData);
            return newData;
            // bunlar console.log'u çalıştırabilmek için değişkene atama yapmak içindi. onun yerine bu da yapılabilir:
            // setEditData(prev => ({ ...prev, [whichOne]: editedValue })) 
        });
        // prev kullandık çünkü react prev'i garantiyle güncel tutar. 
        // react: tüm setState çağrılarını toplar (batching yani toplu işleme).
        // Component re-render'dan sonra state günceller.
        // Bu yüzden aynı fonksiyonda:
        /**const [count, setCount] = useState(0);
         * function hanldeClick() {
            * console.log(count);  // 0
            * setCount(count + 1);  // 0 + 1 ama değişmedi çünkü re-render için tüm state'lerin toplanma işlemi daha bitmedi. yani react: "tamam, queue'ye ekledim."
            * console.log(count);  // 0 (Queue hala işlenmedi)
            * setCount(count + 1);  // React: "Bunu da queue'ye ekledm"
            * console.log(count);  // 0 (Queuee hala işlenmedi)
            * // bütün batching yani toplu işlemi işlemleri bitince react count'u 1'e eşitler. çünkü en sonuncusunda count'u yeniden atadığımızı düşün. 0 + 1 = 1. öncekinde 1 atama setState çağrısı alındı ama işlenmedi. işlenmediği için ikincisi de 1 atama çağrısıydı ve sonuç 1. 
         * }
         * 
         * AMA PREV ÖYLE DEĞİL; GÜNCEL DEĞER GARANTİ EDER. mesela kullanıcı çok hızlı yazdığında veya birden fazla field aynı anda değiştiğinde prev kullanmazsak önceki değişiklikler kaybolabilir.hızlı tıklamayla mesela aynı anda birçok setCount tanımlamış gibi düşünebilirsin. yani yukarıdaki count'lu örnekteki gibi. PREV GÜVENLİ!
         */
    };

    const saveAllChanges = () => {  // yukarıdaki handle anlık input değişikliklerini state ile kayıt altında tutarken bu fonksiyon artık işin gönderme ve veriyi kalıcı hale getirme aşamasıdır. front-end adına veriyi kalıcı kaydetmek için değişen veriler kadar kaydeder.
        const changes = {};  // bu değişkeni tanımlama sebebimiz mesela 100 field'lı bir form'da sadece değişen değerleri kaydedip göndermek. eğer direkt input tarafında onBlur ve onKeyDown ve button tarafında onClick içinde onEdit'i çağırıp direkt editData'yi gönderseydik veri çok güzel de kaydedilirdi ama bu ilerisini düşündüğümüz zaman 100 ayrı field'lı bir form'da yani 100 input'lu bir form'da server'ın yorulmasına sebep olabileceğinden performans açısından tavsiye edilmemektedir. Yani özetle:
        // küçük değişiklik = küçük request (network trafiği rahatlar) -> MongoDb sadece değişen field'ları günceller (audit log'lar daha temiz).
        // Audit log: Kim, ne zaman, neyi değiştirdi? içinde userId=123, action="Update" (mesela), table="task", recordId="task_456", changesFields: ["title"], oldValues {title: "eski Başlık"}, newValues: {title: "yeni Başlık"}, timestamp: "2025-01-01 14:30:22" gibi verileri tutar. eğer bu fonsiyon gibi daha güvenli bir yol seçmeyip direkt ilgili prop'lar altında (onBlur, onKeyDown, onClick) onEdit'i çağırsaydık o zaman 100 field'lı bir senaryo bir satır bile değişse Audit log'un changesFields, oldValues ve newValues key'lerinde 100'er öğe bulunurdu.

        if (task.title !== editData.title) {
            // changes = {title: editData.title.trim()};  // yukarıdaki trim ile boş mu diye kontrol ettik. burada ise boş olmadığını biliyoruz ve sağ ve solda boşluk varsa onları erkenden hallediyoruz.
            changes.title = editData.title.trim() || task.title;  // yukarıdaki satırla göndermedik çünkü changes const bir değişken ve ancak böyle atamaya izin veriyor.
            console.log("title-if", editData.title.trim(), "aaaaaa");
            // console.log("trim() truthy mi?", !!editData.title.trim());
        }
        if (task.description !== editData.description) {
            // changes = {description: editData.description};
            changes.description = editData.description.trim();  // trim'i ben ekledim. mesela description = "vıdıvıdı" iken bir description = "    " yapsak bunu bir sıfırlama olarak kabul etsin ve description = "" yapsın diye ekledim. olmasa boşluk kaydedebilir.
            console.log("description-if");
        }
        if (task.priority !== editData.priority) {
            // changes = {priority: editData.priority};
            changes.priority = editData.priority.trim();  // 3 seçenek olacağı için direkt manuel veri göndereceğiz ("medium" gibi kenar boşluğu olmayan veriler) ama nolur nolmaz eklemek istedim :)
            console.log("priority-if");
        }
        if (task.color !== editData.color) {
            // changes = {color: editData.color};
            changes.color = editData.color.trim();
            console.log("color-if");
        }
        console.log("ifleri bitirdim", changes, Object.keys(changes).length);
        const a = Object.keys(changes).length;
        console.log(typeof a, a);
        
        // Herhangi bir değişiklik varsa yani en az bir değişiklik varsa gönder anlamında:
        if (Object.keys(changes).length > 0) {
            onEdit(changes, task.id);
            // mesela title ve description değiştiyse Object.keys(changes) = ["title", "description"] olur.
            // Object.keys(changes).length = 2;
            // 2 > 0 o zaman onEdit ile veri kaydet.
            setEditData(prev => ({ // normalde useEffect'i kullanarak [task] her değiştiğinde setEditData({task: task.title ... }) diye bir şekilde re-render olmama sorununu çözmüştük. ama bu tek bir değişken değiştirdiğimiz zaman bütün task elemanlarının re-render olmasına sebep oluyordu. Bu yüzden buraya kaydetme işleminden hemen sonra editData'yı güncellesin ve dolayısıyla re-render olayı çözülsün diye setEditData ekledik. ama bunu içine ...editData, ...changes olarak yaptık ama en son süslü parantez eksik diye hata aldık. sonra setEditData(prev => ({...prev, ...changes})); yapınca oldu ama buna da gerek yoktu. çünkü bunu yapmak bize az önceki versiyonun içeriye süslü parantez eklenince doğru olabileceği ihtimalini ilham etti. prev'siz versiyonu deneyince sonuç olarak çalışıyor ama arka arkaya girdi veya tıklama gibi durumlarda tehlike arz edebilir BU YÜZDEN PREV HER ZAMAN DAHA GÜVENLİDİR. bu yüzden prev'e tekrar geri döndük. prev veya direkt editData arasından hangisini kullandığımız güvenliği göz ardı edeceksek önemli değil, ikisi de değişmemiş veriyi tutuyor yani boşluklu veri ("       " gibi). önemli olan süslü parantez ile bunları yaymak için kullanacağımız ... operatörüne izin vermek. süslü parantez olmayınca hangisini kullanırsak kullan ...'dan dolayı hata verir. Hatamızın adı da: object is not iterable (cannot read property Symbol(Symbol.iterator)).
                ...prev, ...changes}));
            console.log("kaydedildi", editData);  // prev kullanmazsan burada güncel görünmez sonrasında tek çağrı olduğu için güncellenir. 
        }

        // setShowMenu(false);
    };



    // const fareCardUzerinde () => {
        
    // };

    // const fareCardDisinda () => {
    //     setCardColor("")
    // };
    

    return (
        <div 
            className="task-card" 
                onMouseEnter={() => {
                        setShowMenu(true);
                }}
                onMouseLeave={() => {
                    if (!isClicked) {
                        setShowMenu(false);
                    }
                }}
                style={{ 
                    '--card-color': task.color,
                }}
                onClick={(e) => {setShowMenu(true); e.stopPropagation();}}
                // onBlur={() => {
                //     saveAllChanges();
                //     setShowMenu(false);          
                // }}  // sadece değişiklik kaydı için dışa her tıklanınca çalışır. kaydetmeyi burada yaptık çünkü useEffect sadece component mount edildiği zaman çalışır. document.addEventListener başlatıldığı için card var olduğu sürece hep çalışır. bu yüzden saveAllChanges'ı oraya taşısak daha mantıklı değil mi sorusu aklına gelebilir? Olmaz! Çünkü: saveAllChanges'ı içinde çağırınca hangi kart olduğunu anlamayacağı için kaydedemez. Ayrıca document.addEventListener ile tüm html'ce global hale gelen(html etiketiyle eşit tab'da tutulur hale gelen) handleDocumentClick fonksiyonu, saveAllChanges gibi local bir değişkene erişemez.
            // onMouseOver={}
        >
            <div className="task-card-without-priority">
                <div className="task-card-padding-div">
                    <div 
                        className="task-header"
                    >
                            <textarea 
                                ref={titleRef}
                                className='menu-edit-input'
                                value={editData.title}
                                onChange={(e) => {
                                    handleInputChange(e.target.value, "title");
                                    handleAutoResize(titleRef);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && (saveAllChanges())}
                                onClick={(e) => {e.stopPropagation(); setIsClicked(true);}}
                                onBlur={(e) => {
                                    console.log("Input dışına tıklandı", e.target.value);
                                    saveAllChanges();
                                }}
                                rows={1}  // Başlangıç satırı
                                style={{ resize: 'none' }}
                            />
                    </div>  
                    

                            <div 
                                className="task-actions"
                                >
                                {(task.description !== '' || showMenu === true) && (
                                    <div style={{ display: 'flex' }}>
                                        {(showMenu && !isClicked && editData.description ==='') && (
                                            <div style={{width: '16px', height: '16px', alignItems: 'center', padding: '6px 0px', color: 'white' }}>
                                                <img alt="ayrıntı" src={descriptionIcon}
                                                    style={{
                                                        width: '16px', height: '16px',
                                                        alignContent: 'center'
                                                    }}
                                                />
                                            </div>
                                        )}
                                                <textarea 
                                                    ref={descriptionRef}
                                                    className='menu-edit-description'
                                                    value={editData.description}
                                                    onChange={(e) => handleInputChange(e.target.value, "description")}
                                                    placeholder={editData.description ? "" : `Ayrıntılar`}
                                                    onKeyDown={(e) => e.key === 'Enter' && (saveAllChanges())}
                                                    onClick={(e) => {e.stopPropagation(); setIsClicked(true);}}
                                                    onBlur={(e) => {
                                                        console.log("Input dışına tıklandı", e.target.value);
                                                        saveAllChanges();
                                                        setIsClicked(false);
                                                    }}
                                                    // onFocus={() => {
                                                    //     isInputFocusedRef.current = true;  // Hemen günceller. Focus oluyoruz diye. Bu sayede task-card onMouseLeave bile olsa bu değer sayesinde if ile kontrol ederiz showMenu ayarlamak için. Eğer onMouseLeave ise ama onFocus sayesinde ayarladığımız isInputFocusedRef hala true ise o zaman showMenu false yapıp task-card genişletmeyi kapatmaz. ama eğer onMouseLeave ise ve focus hazır
                                                    // }} 
                                                />
                                    </div>
                                )}
                                <div className="task-footer">
                                    {(task.priority !== '' || showMenu === true) && (
                                        <div className={`task-priority priority-${task.priority}`}>    
                                            <div
                                                className='priority-display'
                                                onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                                            >
                                                {task.priority || ""} ▼
                                            </div>

                                            {showPriorityMenu && (
                                                <div>
                                                    
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                </div>
            </div>
             <div className='task-color-and-priority-changer'>

            </div>
        </div>
    );
}

export default TaskCard;