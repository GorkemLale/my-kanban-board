import { useState, useEffect, useRef } from 'react';
import { colorPalette } from '../../utils/colorUtils';
import './BoardCard.css';
import descriptionIcon from '../../../assets/description-icon.png';


function BoardCard ({ board, onEdit, onDelete }) {
    const [editData, setEditData] = useState(board);  // board.title, board.description..?
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showColorMenu, setShowColorMenu] = useState(false);


    const titleRef = useRef(null);  // useRef de değişken saklar ama state gibi re-render olmaz. COM element referansı tutmak için kullanılır.
    const descriptionRef = useRef(null);
    const boardCardRef = useRef(null);
    const currentEditData = useRef(editData);
    
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
    };

      const saveAllChanges = () => {  // yukarıdaki handle anlık input değişikliklerini state ile kayıt altında tutarken bu fonksiyon artık işin gönderme ve veriyi kalıcı hale getirme aşamasıdır. front-end adına veriyi kalıcı kaydetmek için değişen veriler kadar kaydeder.
        const changes = {};  // bu değişkeni tanımlama sebebimiz mesela 100 field'lı bir form'da sadece değişen değerleri kaydedip göndermek. eğer direkt input tarafında onBlur ve onKeyDown ve button tarafında onClick içinde onEdit'i çağırıp direkt editData'yi gönderseydik veri çok güzel de kaydedilirdi ama bu ilerisini düşündüğümüz zaman 100 ayrı field'lı bir form'da yani 100 input'lu bir form'da server'ın yorulmasına sebep olabileceğinden performans açısından tavsiye edilmemektedir. Yani özetle:
        // küçük değişiklik = küçük request (network trafiği rahatlar) -> MongoDb sadece değişen field'ları günceller (audit log'lar daha temiz).
        // Audit log: Kim, ne zaman, neyi değiştirdi? içinde userId=123, action="Update" (mesela), table="board", recordId="board_456", changesFields: ["title"], oldValues {title: "eski Başlık"}, newValues: {title: "yeni Başlık"}, timestamp: "2025-01-01 14:30:22" gibi verileri tutar. eğer bu fonsiyon gibi daha güvenli bir yol seçmeyip direkt ilgili prop'lar altında (onBlur, onKeyDown, onClick) onEdit'i çağırsaydık o zaman 100 field'lı bir senaryo bir satır bile değişse Audit log'un changesFields, oldValues ve newValues key'lerinde 100'er öğe bulunurdu.

        const currentData = currentEditData.current;  // çünkü editData state'in geç güncellenmesinden dolayı gönderilmiyor. sadece UI ve currentEditData.curreunt'ı değiştirmek için gerekli state şu anlık.
        if (board.title !== currentData.title) {
            // changes = {title: currentData.title.trim()};  // yukarıdaki trim ile boş mu diye kontrol ettik. burada ise boş olmadığını biliyoruz ve sağ ve solda boşluk varsa onları erkenden hallediyoruz.
            changes.title = currentData.title.trim() || board.title;  // yukarıdaki satırla göndermedik çünkü changes const bir değişken ve ancak böyle atamaya izin veriyor.
            console.log("title-if", currentData.title.trim(), "aaaaaa");
            // console.log("trim() truthy mi?", !!currentData.title.trim());
        }
        if (board.description !== currentData.description) {
            // changes = {description: currentData.description};
            changes.description = currentData.description.trim();  // trim'i ben ekledim. mesela description = "vıdıvıdı" iken bir description = "    " yapsak bunu bir sıfırlama olarak kabul etsin ve description = "" yapsın diye ekledim. olmasa boşluk kaydedebilir.
            console.log("description-if");
        }
        if (board.priority !== currentData.priority) {
            // changes = {priority: currentData.priority};
            changes.priority = currentData.priority.trim();  // 3 seçenek olacağı için direkt manuel veri göndereceğiz ("medium" gibi kenar boşluğu olmayan veriler) ama nolur nolmaz eklemek istedim :)
            console.log("priority-if");
        }
        if (board.color !== currentData.color) {
            // changes = {color: currentData.color};
            changes.color = currentData.color.trim();
            console.log("color-if");
        }
        console.log("ifleri bitirdim", changes, Object.keys(changes).length);
        const a = Object.keys(changes).length;
        console.log(typeof a, a);
        
        // Herhangi bir değişiklik varsa yani en az bir değişiklik varsa gönder anlamında:
        if (Object.keys(changes).length > 0) {
            onEdit(changes, board._id);
            setEditData(prev => ({
                ...prev, ...changes}));
            console.log("kaydedildi", currentData);  // prev kullanmazsan burada güncel görünmez sonrasında tek çağrı olduğu için güncellenir.
        }

        // setShowMenu(false);
    };

    // useEffect(() => {  // click'tir cartır curttur, listener event
        
    // });

    return (
<div
            className="board-card"
                ref={boardCardRef}
                onMouseEnter={() => {
                    setShowMenu(true);

                }}
                onMouseLeave={() => {
                    if (!isEditing) {
                        setShowMenu(false);
                        setShowColorMenu(false);
                    }
                }}
                style={{ 
                    '--board-color': board.color,
                }}
                onClick={(e) => {setShowMenu(true); e.stopPropagation();}}
        >
            <div className="board-card-content">
                <div className="board-card-padding-div">
                    <div 
                        className="board-header"
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
                                        saveAllChanges();
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
                                className="board-actions"
                                >
                                {(board.description !== '' || showMenu === true) && (
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
                                                    onKeyDown={(e) => e.key === 'Enter' && (saveAllChanges())}
                                                    onClick={(e) => {e.stopPropagation(); setIsEditing(true);}}
                                                    onFocus={() => setIsEditing(true)}
                                                />
                                    </div>
                                )}
                                <div className="board-footer">
                                    <div>
                                        <div 
                                            className="board-color" 
                                            style={{'--color': editData.color,}}
                                        >
                                            <div className='board-color-display'>    
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
                                                                onEdit({color: color}, board._id);
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
                                                    onDelete(board._id);
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
                                                        onEdit({status: listName}, board._id);
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

export default BoardCard;