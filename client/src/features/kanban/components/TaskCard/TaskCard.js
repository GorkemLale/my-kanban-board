import Button from '../../../../components/Button/Button';
import './TaskCard.css';
import descriptionIcon from '../../../../assets/description-icon.png';
import { useState, useEffect, useRef } from 'react';
import { colorPalette } from '../../../utils/colorUtils';
// React Strict Mode: Beklenmedik yan etkileri tespit eder. Component'i kasıtlı olarak iki kez render ederek yan etkileri ortaya çıkarır.


export function TaskCard({ task, isNew = false, onEdit, onDelete, onSave, onCancel }) {
    const [showMenu, setShowMenu] = useState(false);
    const [editData, setEditData] = useState({  // bu UI için kaydetme sonrasında re-render tetikler. Ama sadece bunla olmadığını fark ettik çünkü state güncellenmekte gecikiyor (bkz. batching) ve biz kaydetmek için card dışında bir yere tıkladığımızda state henüz güncellenmeden listener tetikleniyor. Enter ile kaydetmede sorun yok. onda hemen oluyor. UI için state barındırmamız zorunlu. kaydetmek içinse sadece listener için gerekli.
        title: task.title,
        description: task.description,
        priority: task.priority,
        color: task.color
    });
    const [showPriorityMenu, setShowPriorityMenu] = useState(false);
    const [showColorMenu, setShowColorMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);  // tetiklenir ve useEffect başlatır. bu sayede o sırada listener başlatılır ve dışarıya tıklanma durumunda kayıt işlemi tamamlanır. sonrasında da isEditing false edilir ve listener remove edilir. Focus → isEditing(true) → Listener Start → Outside Click → Save → isEditing(false) → Listener Remove(cleanup)
    
    
    const saveHandle = () => {
        // Normalde currentEditData ref'i sadece listener için lazım çünkü değer değişince çalışan useEffect'teki listener state gecikmesinden kayıt işlemi yapamıyor. Ama ekstradan enter ve listener için saveHandle'a tanımlayacağımız ek bir parametre ile enter için editData kullanmaya listener içinse currentEditData ref'ini kullanmaya gerek yok. direkt her ikisi için de Ref kullanırız hem daha güvenli. Bu yüzden:
        const currentData = currentEditData.current;
        if (isNew) {
            // if (!editData.title.trim()) {
            //     // editData.title = "New Task";  // state mutation! yapamazsın.
            // }
            console.log('burada ilk editdata var', currentData);
            onSave({
                title: currentData.title.trim() || "New Task",
                description: currentData.description.trim(),
                priority: currentData.priority,
                color: currentData.color
            });
        } else {
            console.log("yeni Değilim");
            saveAllChanges();
        } 
    };
    
    const titleRef = useRef(null);  // useRef de değişken saklar ama state gibi re-render olmaz. COM element referansı tutmak için kullanılır.
    const descriptionRef = useRef(null);
    const taskCardRef = useRef(null);
    const currentEditData = useRef(editData);
    
    useEffect(() => {  // ÇOK ÖNEMLİ: Sadece isEditing değişince çalışmaz, component mount aşamasında da çalışır!!!
        console.log("useEffect çalışıııyor", isEditing);
        const handleClickOutside = (event) => {
            // TaskCard dışına tıklandıysa
            if (taskCardRef.current && !taskCardRef.current.contains(event.target)) {  // taskCardRef'in current'ı varsa ve current'u event'in target'ını içermiyorsa bu koşul ifadesine girer.
                // Save işlemi yap (sadece yeni task için) 
                if (isEditing) {
                    if(isNew) {
                        saveHandle();
                    } else {
                        saveAllChanges();  // mevcut task için batch save
                        console.log("değerss kayıtsss edilss");
                    }
                }
                setShowMenu(false);
                setIsEditing(false);
                setShowPriorityMenu(false);
                setShowColorMenu(false);
            }
        };

        // başlangıçta isNew false olduğu için görev oluşturma anında girer sadece buraya. düzenleme yaptığın zaman false olan isNew yüzünden sadece cleanup çalışır. Bu yüzden isNew şartını hem buradan hem de dependecy array'den kaldırdım çünkü isNew true olduğu zaman isEditing de true oluyor.
        if (isEditing) {  // bu sayede listener sadece gerektiğinde eklenir. listener tıklamamızı bekler mouse click'ine basılı tutulduğu anda ise görevini yerine getirir ve içindeki fonksiyonu gerçekleştirir. Eğer bu koşul olmasaydı sayfaya her tıklandığında daha tık bırakılmadan aktif olurdu ve habire onları false ederdi. Yani gereksiz şekilde dinleme ve her girdiye değer atama yapmaya çalışırdık (Performans).
            document.addEventListener('mousedown', handleClickOutside);  // mousedown: fareye basılı tutulduğu an iken 'click' basıp bıraktığın andır. mousedown drag(sürükleme) başlangıcını yakalayabilir ama 'click' yakalayamaz.
            console.log("listener başladı");
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                console.log("bitişşş");
            };
        }


        // [] dependency array'i boş olan eski useEffect'in listener tanımlamalarını aşağıda yanında uzunca notlar var diye buraya eklemek istedim.
        // //document.addEventListener ile tüm html'ce global hale getirilir.
        // document.addEventListener('click', handleDocumentClick);  // sayfadaki bütün tıklamalarda bunu çağır ve handleDocumentClick çalıştır.
        // return () => document.removeEventListener('click', handleDocumentClick);  // bu da cleanup kısmı. yani component unmount olduğunda (sayfa değişimi, component conditional render ile component kaldırma {showCard && <cartcurt><cartcurt>}, parent component'ten kaldırılma (taskcard'ın parent'i task list. taskler silinince map fonskiyonunda tasks içinde bulunamadığı için kaldırılır..)) listener'ı kaldırır ki dinlemeye devam etmesin ve memory leak olmasın. sayda değişse kalmaz. sayfa değişiminde zaten tüm sayfa yenilendiği için return anlamsız olurdu. ama conditional rendering için düşününce mesela mesela task card ekledin ve sildin, bu durumda return olmazsa handleDocumentClick bellekte tutulmaya devam eder. bunu 10 tane için yapınca ise card görünmese bile hanleDocumentClick adlı fonksiyone bellekte tutulur ve meşgul eder.
    }, [isEditing]);  // dependecy'den isNew'i kaldırdık çünkü zaten new durumundayken ayrıca isEditing true oluyor.


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



    const handleInputChange = (editedValue, whichOne) => {  // Bu handle fonksiyon anlık değişiklikleri kayıtta tutmak içinken (yani inputtaki onChane ile çağrılırken) aşağıdaki saveAllChanges ise artık bu kaydedilmiş verilerden kaç tane varsa onları gönderip kaydetme fonksiyonudur (yani input için onkeyDown ve onBlur ile button için onClick ile çağrılır).
        setEditData(prev => {
            const newData = {...prev, [whichOne]: editedValue};
            currentEditData.current = newData;
            console.log("input değiştirildi", newData);
            return newData;
            // bunlar console.log'u çalıştırabilmek için değişkene atama yapmak içindi. onun yerine bu da yapılabilir:
            // setEditData(prev => ({ ...prev, [whichOne]: editedValue })) 
        });
        // console.log("editData güncellendi----", editData);  // bu eski değer gösterir. Çünkü setState asenkron çalışır. yani hemen güncellemez bu yüzden de console.log çalıştırıldığı zaman eski değer gösterir. ama state queue'ye eklenir ve re-render'dan sonra güncellenir. Bu yüzden de bu satırdaki console.log yorum satırı değilken 3 defa çıktı alırız.
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

        const currentData = currentEditData.current;  // çünkü editData state'in geç güncellenmesinden dolayı gönderilmiyor. sadece UI ve currentEditData.curreunt'ı değiştirmek için gerekli state şu anlık.
        if (task.title !== currentData.title) {
            // changes = {title: currentData.title.trim()};  // yukarıdaki trim ile boş mu diye kontrol ettik. burada ise boş olmadığını biliyoruz ve sağ ve solda boşluk varsa onları erkenden hallediyoruz.
            changes.title = currentData.title.trim() || task.title;  // yukarıdaki satırla göndermedik çünkü changes const bir değişken ve ancak böyle atamaya izin veriyor.
            console.log("title-if", currentData.title.trim(), "aaaaaa");
            // console.log("trim() truthy mi?", !!currentData.title.trim());
        }
        if (task.description !== currentData.description) {
            // changes = {description: currentData.description};
            changes.description = currentData.description.trim();  // trim'i ben ekledim. mesela description = "vıdıvıdı" iken bir description = "    " yapsak bunu bir sıfırlama olarak kabul etsin ve description = "" yapsın diye ekledim. olmasa boşluk kaydedebilir.
            console.log("description-if");
        }
        if (task.priority !== currentData.priority) {
            // changes = {priority: currentData.priority};
            changes.priority = currentData.priority.trim();  // 3 seçenek olacağı için direkt manuel veri göndereceğiz ("medium" gibi kenar boşluğu olmayan veriler) ama nolur nolmaz eklemek istedim :)
            console.log("priority-if");
        }
        if (task.color !== currentData.color) {
            // changes = {color: currentData.color};
            changes.color = currentData.color.trim();
            console.log("color-if");
        }
        console.log("ifleri bitirdim", changes, Object.keys(changes).length);
        const a = Object.keys(changes).length;
        console.log(typeof a, a);
        
        // Herhangi bir değişiklik varsa yani en az bir değişiklik varsa gönder anlamında:
        if (Object.keys(changes).length > 0) {
            onEdit(changes, task._id);  // hepsi bunun ._id yerine .id kalmasından idi. bu durum yüzünden 404 ve 400 hataları aldım put ederken
            // mesela title ve description değiştiyse Object.keys(changes) = ["title", "description"] olur.
            // Object.keys(changes).length = 2;
            // 2 > 0 o zaman onEdit ile veri kaydet.
            setEditData(prev => ({ // normalde useEffect'i kullanarak [task] her değiştiğinde setEditData({task: task.title ... }) diye bir şekilde re-render olmama sorununu çözmüştük. ama bu tek bir değişken değiştirdiğimiz zaman bütün task elemanlarının re-render olmasına sebep oluyordu. Bu yüzden buraya kaydetme işleminden hemen sonra currentData'yı güncellesin ve dolayısıyla re-render olayı çözülsün diye setEditData ekledik. ama bunu içine ...currentData, ...changes olarak yaptık ama en son süslü parantez eksik diye hata aldık. sonra setEditData(prev => ({...prev, ...changes})); yapınca oldu ama buna da gerek yoktu. çünkü bunu yapmak bize az önceki versiyonun içeriye süslü parantez eklenince doğru olabileceği ihtimalini ilham etti. prev'siz versiyonu deneyince sonuç olarak çalışıyor ama arka arkaya girdi veya tıklama gibi durumlarda tehlike arz edebilir BU YÜZDEN PREV HER ZAMAN DAHA GÜVENLİDİR. bu yüzden prev'e tekrar geri döndük. prev veya direkt currentData arasından hangisini kullandığımız güvenliği göz ardı edeceksek önemli değil, ikisi de değişmemiş veriyi tutuyor yani boşluklu veri ("       " gibi). önemli olan süslü parantez ile bunları yaymak için kullanacağımız ... operatörüne izin vermek. süslü parantez olmayınca hangisini kullanırsak kullan ...'dan dolayı hata verir. Hatamızın adı da: object is not iterable (cannot read property Symbol(Symbol.iterator)).
                ...prev, ...changes}));
            console.log("kaydedildi", currentData);  // prev kullanmazsan burada güncel görünmez sonrasında tek çağrı olduğu için güncellenir.
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
                ref={taskCardRef}
                onMouseEnter={() => {
                    setShowMenu(true);

                }}
                onMouseLeave={() => {
                    if (!isEditing) {
                        setShowMenu(false);
                        setShowPriorityMenu(false);
                        setShowColorMenu(false);
                    }
                }}
                style={{ 
                    '--card-color': task.color,
                }}
                onClick={(e) => {setShowMenu(true); e.stopPropagation();}}
                // onBlur={() => {
                //     saveHandle();
                //     setShowMenu(false);          
                // }}  // sadece değişiklik kaydı için dışa her tıklanınca çalışır. kaydetmeyi burada yaptık çünkü useEffect sadece component mount edildiği zaman çalışır. document.addEventListener başlatıldığı için card var olduğu sürece hep çalışır. bu yüzden saveHandle'ı oraya taşısak daha mantıklı değil mi sorusu aklına gelebilir? Olmaz! Çünkü: saveHandle'ı içinde çağırınca hangi kart olduğunu anlamayacağı için kaydedemez. Ayrıca document.addEventListener ile tüm html'ce global hale gelen(html etiketiyle eşit tab'da tutulur hale gelen) handleDocumentClick fonksiyonu, saveHandle gibi local bir değişkene erişemez.
            // onMouseOver={}
        >
            <div className="task-card-content">
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
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        // onEdit(editData.title, task._id);  // performans açısından saveHandle daha mantıklı
                                        saveHandle();
                                        setShowMenu(false);
                                        setIsEditing(false);
                                    }
                                }}
                                onClick={(e) => {e.stopPropagation(); setIsEditing(true);}}
                                // onBlur={(e) => {
                                //     console.log("Input dışına tıklandı", e.target.value);
                                //     saveHandle();
                                // }}
                                onFocus={() => setIsEditing(true)}
                                rows={1}  // Başlangıç satırı  // yeni düzenleme = Ne diyo bu dayiiii?
                                style={{ resize: 'none' }}
                            />
                    </div>  
                    

                            <div 
                                className="task-actions"
                                >
                                {(task.description !== '' || showMenu === true) && (
                                    <div style={{ display: 'flex' }}>
                                        {(showMenu && !isEditing && editData.description ==='') && (
                                            <div style={{width: '16px', height: '16px', alignItems: 'center', padding: '0px', color: 'white' }}>
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
                                                    onKeyDown={(e) => e.key === 'Enter' && (saveHandle())}
                                                    onClick={(e) => {e.stopPropagation(); setIsEditing(true);}}
                                                    // onBlur={(e) => {
                                                    //     console.log("Input dışına tıklandı", e.target.value);
                                                    //     saveHandle();
                                                    //     setIsClicked(false);  // Artık setIsEditing, sileceğim zaten bu yorum satılarını
                                                    // }}
                                                    onFocus={() => setIsEditing(true)}
                                                    // onFocus={() => {
                                                    //     isInputFocusedRef.current = true;  // Hemen günceller. Focus oluyoruz diye. Bu sayede task-card onMouseLeave bile olsa bu değer sayesinde if ile kontrol ederiz showMenu ayarlamak için. Eğer onMouseLeave ise ama onFocus sayesinde ayarladığımız isInputFocusedRef hala true ise o zaman showMenu false yapıp task-card genişletmeyi kapatmaz. ama eğer onMouseLeave ise ve focus hazır
                                                    // }} 
                                                />
                                    </div>
                                )}
                                <div className="task-footer">
                                    <div className={`task-priority priority-${editData.priority}`}>    
                                        <div
                                            className='priority-display'
                                            onClick={() => {setShowPriorityMenu(!showPriorityMenu); setIsEditing(true);}}
                                        >
                                            {editData.priority === 'low' ? "Low" : editData.priority === 'medium' ? "Medium" : "High" } ▼
                                        </div>

                                        {(showPriorityMenu && showMenu) && (
                                            <div style={{backgroundColor: 'white'}}>
                                                <div onClick={(e) => {e.stopPropagation(); handleInputChange('low','priority'); setShowPriorityMenu(false); onEdit({priority: 'low'}, task._id);}} className="priority-low">
                                                    Low
                                                </div>
                                                <div onClick={(e) => {e.stopPropagation(); handleInputChange('medium','priority'); setShowPriorityMenu(false); onEdit({priority: 'medium'}, task._id);}}className="priority-medium">
                                                    Medium
                                                </div>
                                                <div onClick={(e) => {e.stopPropagation(); handleInputChange('high','priority'); setShowPriorityMenu(false); onEdit({priority: 'high'}, task._id);}}className="priority-high">
                                                    High
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div 
                                            className="task-color" 
                                            style={{'--color': editData.color,}}
                                        >
                                            <div className='task-color-display'>    
                                                <div
                                                    className='color-display'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowColorMenu(!showColorMenu);
                                                        setIsEditing(true);
                                                    }}
                                                >
                                                    
                                                </div>

                                                {(showColorMenu && showMenu) && (
                                                    <div className='color-menu-dropdown'>
                                                    {colorPalette.map(color => (
                                                        <div
                                                            key={color} 
                                                            className={`color-option ${editData.color === color ? 'selected' : ''}`}
                                                            onClick={(e) => {e.stopPropagation(); handleInputChange(color,'color'); setShowColorMenu(false); 
                                                            if (isNew) {
                                                                setEditData(prev => ({...prev, color: color}));
                                                            } else {
                                                                onEdit({color: color}, task._id);
                                                            }
                                                        }}
                                                        >
                                                            <div className='color-circle' style={{backgroundColor: color}}>
                                                                {editData.color === color && (
                                                                    <span className='checkmark'></span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* {showMenu && (
                                    <div>
                                        <br></br>
                                        <div>
                                            <button 
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(task._id);
                                            }}
                                            title="Görevi Sil"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        
                                        <br></br>

                                        <div style={{backgroundColor: `${editData.color}`, height: '30px', display: 'flex', justifyContent: 'space-between'}}>
                                            {['backlog','todo','inprogress','done']
                                            .filter(listName => listName !== editData.status)
                                            .map(listName => (
                                            
                                                <div
                                                    key={listName} 
                                                    style={{ color: 'white', margin: '0px 2px', border: '1px solid white', borderRadius: '4px', padding: '5px 4px' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit({status: listName}, task._id);
                                                    }}
                                                >
                                                    {listName}
                                                </div>
                                                
                                            ))}
                                        </div>
                                </div>
                                )} */}
                            </div>
                </div>
            </div>
             <div className='move'>

            </div>
        </div>
    );
};

// export default TaskCard;