import { useState, useEffect, useRef } from 'react';
import BoardCard  from './BoardCard';
import './HomePage.css';
// import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import sideBarIcon from '../../../assets/side-bar.png'
import Button from '../../../components/Button/Button';  // iki defa buton çünkü bir tanesi de klasör adı. ileride başka ortak component'ler eklenir diye kendi klasöründe tanımladım.
import plusIcon from '../../../assets/plus.png';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState([]);
    const [visited, setVisited] = useState([]);
    const [isSideBar, setIsSideBar] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createData, setCreateData] = useState({
        title: "",
        description: "",
        color: ""
    });

    const navigate = useNavigate();

    const currentCreateData = useRef({});

    useEffect(() => {
        const fetchtAllBoards = async () => {
            try {
                setLoading(true);
                
                const response = await axios.get('/api/boards/');  // amanın await unutma.
                setBoards(response.data.data || []);
                console.log(response.data.data);
                
                const visitedBoard = JSON.parse(localStorage.getItem('recentVisitedBoards')) || [];


                setVisited(visitedBoard);
            } catch (err) {
                console.error("Board Getirme Hatası", err);
            } finally {  // olmasaydı da olur muydu acaba, sonuçta bu scope'a almadan da setLoading(false); yapabilirdik.
                setLoading(false);
            }
        };

        fetchtAllBoards();
    }, []);

    const createBoard = async () => {
        try {
            setLoading(true);
            
            const currentData = currentCreateData.current;
            const response = await axios.post('/api/boards/', {  // ulan yine az kala await unutuyordun
                title: currentData.title.trim() || "New Board",
                description: currentData.description?.trim() || "",  // boardData.description?.trim()'deki soru işareti(?) niye?
                color: currentData.color || '#6A6DCD'

            });

            setBoards(prev => [response.data.data, ...prev]);

            setIsCreating(false);

            console.log("Board Oluşturuldu: ", response.data.data)
        } catch (err) {
            console.error("Board oluşturma hatası", err);
            alert("Board oluşturulamadı.")

        } finally {
            setLoading(false);
        }
    };

    const editBoard = async (changes, boardId) => {
        try {
            setLoading(true);

            const boardToUpdate = boards.find(b => b._id === boardId);  // local'deki listede güncellenmek istenen id'ye ait board'in tüm element'leriyle güncel halini çekiyoruz.
            const updatedBoard = {...boardToUpdate, ...changes};
            const response = await axios.put(`/api/boards/${boardToUpdate.id}`, updatedBoard);  // changes gönderemiyoruz çünkü eğer changes title içermiyorsa validator create methoduyla ortak kullanıldığından title zorunlu tanımlandığı için tüm veriyi gönderiyoruz, güncellenmeyenleri de.
            console.log("board güncellendi: ", response.data);

            // Backend'e güncelleme gönderme 
            setBoards(boards.map(b => 
                b._id === boardId ? updatedBoard : b  // map methotu içinde değişkeni veri başlığı(?) olarak kullanmak istiyorsan köşeli paranteze almalısın! 
            ));  // veya           {...b, ...changes} (önceden böyleydi) kullanırsın updatedBoard yerine
            
            
        } catch (err) {
            console.error('Board düzenlenirken hata oluştu: ', err);
            alert("board düzenlenemedi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='home-page'>
            <div className='header-div'>
                <div className='icon-and-title'>
                    <div className='side-button-div'
                        onClick={() => setIsSideBar(!isSideBar)}
                    >
                        <div className='side-icon-div'>
                            <img
                                alt='side-bar-icon'
                                src={sideBarIcon}
                                style={{ width: '20px', height: '20px'}}
                            />
                        </div>
                    </div>
                <span className='site-title'>
                    KanbanBoard
                </span>
                </div>
                <div className="search-div">
                    <textarea
                        className='search-input'
                    
                    />
                </div>
            </div>
            <div className={`main-page ${isSideBar ? 'sidebar-open' : ''}`}>
                <div className={`side-bar ${isSideBar ? 'open' : ''}`}>
                    {/* Sidebar içeriği */}
                    <div className='add-board-container'>
                        <Button
                            onClick={() => setIsCreating(true)}
                            className="btn-create-board"
                        >
                            <div className='plus-icon-container'>
                                <img alt='+' src={plusIcon} style={{width: '20px', height: '20px'}}/>
                            </div>
                            <div>
                                <div className='create-board-text'>
                                    Create
                                </div>
                            </div>
                        </Button>

                    </div>
                    <h3>Recent Boards</h3>
                    {visited
                        .filter(b => b && b.title)  // null ve undefined kontrolü
                        .slice(0, 5).map(b => (
                        <div key={b.id} className="sidebar-board-item" onClick={(() => navigate(b.id))}>
                            {b.title}
                        </div>
                    ))}
                </div>
                <div className='boards'>
                    {isCreating && (
                        <div className='modal-overlay' onClick={() => setIsCreating(false)}
                        >
                            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                                <h2>Create New Board</h2>
                                <textarea 
                                    placeholder='Board Title'
                                    onChange={(e) => setCreateData(prev => {
                                        const newData = {...prev, title: e.target.value};
                                        currentCreateData.current = newData;
                                        console.log("board Oluşturmada değişimlerss", newData);
                                        return newData;
                                    })}
                                />
                                <textarea
                                    placeholder='Description' 
                                    onChange={(e) => setCreateData(prev => {
                                        const newData = {...prev, description: e.target.value};
                                        currentCreateData.current = newData;
                                        console.log("board Oluşturmada değişimlerss", newData);
                                        return newData;
                                    })}
                                />
                                <div>
                                        <button onClick={() => setIsCreating(false)}>Cancel</button>
                                        <button
                                            onClick={() => createBoard(createData)}
                                        >Create</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="board-list">
                        <div className="board-list-content">
                            {boards.map(board => (  // div döndürmeye gerek yok zaten TaskCard Component'ini tanımlarken gerekli tanımlamalar yapıldı. biz sadece input vereceğiz.
                                <BoardCard 
                                    key={board._id}  // ._id daha iyi bir seçenek olacaktır. kanımca daha hızlı. doğru mu diye araştır!!!
                                    board={board}
                                    onEdit={editBoard}
                                />
                            ))}

                            {boards.length === 0 && (
                                <div className="empty-list">
                                    Henüz board yok    
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default HomePage;