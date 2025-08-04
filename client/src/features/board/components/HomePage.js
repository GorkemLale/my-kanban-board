import { useState, useEffect, useRef } from 'react';
import BoardCard  from './BoardCard';
import './HomePage.css';
// import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import sideBarIcon from '../../../assets/side-bar.png'
import Button from '../../../components/Button/Button';  // iki defa buton çünkü bir tanesi de klasör adı. ileride başka ortak component'ler eklenir diye kendi klasöründe tanımladım.

function HomePage() {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState();
    const [Visited, setVisited] = useState([]);
    const [isSideBar, setIsSideBar] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [editData, setEditData] = useState("");
    
    const deneme_visited = [
        {_id: '6890616b3f0a7bc9748c8c67', id: 'qshctsf2', title: 'dsaasd', taskCount: 0, color: '#6A6DCD'}, 
        {_id: '6888eefcd9cd1adb467f5a2f', id: 'test1234', title: 'xxxxxxxxxxxxxxxxxxx', description: '', taskCount: 4, color: '#6A6DCD'}, 
        {_id: '68890cc8ec007520ce98efc0', id: 'c66ekuk0', title: 'id GEnerator foksoyonono taşıyınca oldo mooo?', description: 'çalışır babam, neden çalışmasın?', taskCount: 0, color: '#6A6DCD'}, 
        {_id: '68890cc7ec007520ce98efbd', id: 'r70x6vu5', title: 'id GEnerator foksoyonono taşıyınca oldo mooo?', description: 'çalışır babam, neden çalışmasın?', taskCount: 0, color: '#6A6DCD'}, 
        {_id: '68890cc7ec007520ce98efba', id: 's2mdnbzl', title: 'id GEnerator foksoyonono taşıyınca oldo mooo?', description: 'çalışır babam, neden çalışmasın?', taskCount: 0, color: '#6A6DCD'}, 
        {_id: '68890cc6ec007520ce98efb7', id: 'nyamdidk', title: 'id GEnerator foksoyonono taşıyınca oldo mooo?', description: 'çalışır babam, neden çalışmasın?', taskCount: 0, color: '#6A6DCD'}, 
        {_id: '68890cc3ec007520ce98efb4', id: '4rek4i0s', title: 'id GEnerator foksoyonono taşıyınca oldo mooo?', description: 'çalışır babam, neden çalışmasın?', taskCount: 0, color: '#6A6DCD'}, 
        {_id: '68890c4eafdad25ebd331653', id: 'w0ak9793', title: 'id GEnerator foksoyonono taşıyınca oldo mooo?', description: 'çalışır babam, neden çalışmasın?', taskCount: 0, color: '#6A6DCD'}, 
        {_id: '68890c4dafdad25ebd331650', id: 'miv533fz', title: 'id GEnerator foksoyonono taşıyınca oldo mooo?', description: 'çalışır babam, neden çalışmasın?', taskCount: 0, color: '#6A6DCD'}, 
        {_id: '68890c4cafdad25ebd33164d', id: 'oc4ugb8c', title: 'id GEnerator foksoyonono taşıyınca oldo mooo?', description: 'çalışır babam, neden çalışmasın?', taskCount: 0, color: '#6A6DCD'}, 
        {_id: '68890c4bafdad25ebd33164a', id: 'p21gw38p', title: 'id GEnerator foksoyonono taşıyınca oldo mooo?', description: 'çalışır babam, neden çalışmasın?', taskCount: 0, color: '#6A6DCD'}, 
        {_id: '68890c4aafdad25ebd331647', id: '8512cymx', title: 'id GEnerator foksoyonono taşıyınca oldo mooo?', description: 'çalışır babam, neden çalışmasın?', taskCount: 0, color: '#6A6DCD'}, 
        {_id: '688908300e6cc6ddefbb4f37', id: 'e6cywu90', title: 'id GEnerator foksoyonono taşıyınca oldo mooo?', description: 'çalışır babam, neden çalışmasın?', taskCount: 0, color: '#6A6DCD'}, 
        {_id: '6889082e0e6cc6ddefbb4f34', id: 'i8xqhhvr', title: 'id GEnerator foksoyonono taşıyınca oldo mooo?', description: 'çalışır babam, neden çalışmasın?', taskCount: 0, color: '#6A6DCD'}, 
        {_id: '6889082c0e6cc6ddefbb4f31', id: 'tygi9iwu', title: 'id GEnerator foksoyonono taşıyınca oldo mooo?', description: 'çalışır babam, neden çalışmasın?', taskCount: 0, color: '#6A6DCD'}, 
        {_id: '6889079b44169c53ce66f5cf', id: 'toor2f3j', title: 'id GEnerator foksoyonono taşıyınca oldo mooo?', description: 'çalışır babam, neden çalışmasın?', taskCount: 0, color: '#6A6DCD'}, 
        {_id: '6888ef0dd9cd1adb467f5a4a', id: 'ofnp1ofq', title: 'titleReturnsuz çalışır mı?', description: 'çalışır babam, neden çalışmasın?', taskCount: 0, color: '#6A6DCD'}, 
        {_id: '6888ef0cd9cd1adb467f5a47', id: 'buawknfx', title: 'titleReturnsuz çalışır mı?', description: 'çalışır babam, neden çalışmasın?', taskCount: 0, color: '#6A6DCD'}, 
        {_id: '6888ef08d9cd1adb467f5a44', id: '8j78jv84', title: 'titleReturnsuz çalışır mı?', description: 'çalışır babam, neden çalışmasın?', taskCount: 0, color: '#6A6DCD'}
    ];

    const currentEditData = useRef(editData);

    useEffect(() => {
        const fetchtAllBoards = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/boards/');  // amanın await unutma.
                setBoards(response.data.data || []);
                console.log(response.data.data);

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
            
            const currentData = currentEditData.current;
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
                    <div className='boardCreateDiv'>
                        <Button
                            onClick={() => setIsCreating(true)}
                            className="btn-create-board"
                        >

                        </Button>
                    </div>

                    <h3>Recent Boards</h3>
                    {deneme_visited.slice(0, 5).map(board => (
                        <div key={board._id} className="sidebar-board-item">
                            {board.title}
                        </div>
                    ))}
                </div>
                <div className='boards'>
                    {isCreating && (
                        <div className='modal-overlay' onClick={() => setIsCreating(false)}
                        >
                            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                                <h2>Create New Board</h2>
                                <input 
                                    type='text' 
                                    placeholder='Board Title'
                                    onChange={(e) => setEditData(prev => {
                                        const newData = {...prev, title: e.target.value};
                                        currentEditData.current = newData;
                                        console.log("board Oluşturmada değişimlerss", newData);
                                        return newData;
                                    })}
                                />
                                <textarea placeholder='Description' />
                                <div>
                                        <button onClick={() => setIsCreating(false)}>cancel</button>
                                        <button
                                            onClick={() => createBoard(editData)}
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