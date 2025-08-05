import { useState, useEffect } from 'react';
import { TaskList } from '../TaskList';
import './KanbanBoard.css';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';


export function KanbanBoard() {
    const { boardId } = useParams();  // boardId'yi url'den çekiyoruz.
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    
    const navigate = useNavigate();

    const goToMain = () => {
        navigate('/');
    };

    useEffect(() => {  // sayfa ilk açıldığı zaman çalılır ve tüm taskleri localdeki tasks dizisine eşitler
        if (boardId) {        
        const fetchTasks = async () => {
                try {
                    setLoading(true);
                    setError(null);
                    console.log("API çağrısı zamannııııı");
                    const response = await axios.get(`/api/tasks/${boardId}`);
                    console.log(response.data.data);
                    setTasks(response.data.data || []);  // Olur da boş dönerse kafayı yeme aslan perçası
                } catch (err) {
                    console.error("API error", err);
                    setError("Görevler yüklenemedi");
                    if (err.response?.status === 404) {  // burası
                        setTasks([]);  // olur da catch'ten öncekinde atamaya gelmeden hata olur da catch'e atlar diye
                    }
                } finally {
                    setLoading(false);
                }
            };
            
            fetchTasks();
        }
    }, [boardId]);




    
    // Yeni görev ekleme, yani mesela genelde insanlar önce yapılacaklara eklerle ama eklemeyi unuttuğun yapıyor olduğun (inprogress) ve yapıp bitirdiğin (done) işler için de ekleme yapabilir diye bu handle fonskiyon tanımlandı. içine aldığı status'e göre o listeye görev ekliyor. 
    const handleAddTask = async (stat, task) => {
        try {
            setLoading(true);  // AI önerdi diye ekledim. olmasaydı da olurdu da animasyon cart curt
            
            console.log(`Şimdi de task'tayim. ve ${task} adlı görevi ${stat}'a ekledim `);
            
            const response = await axios.post(`/api/tasks/${boardId}`, {...task, status: stat});
            console.log(response.data.data);
            setTasks([response.data.data, ...tasks]);  // setTasks() içine direkt response.data.data atarsan onu object'e çevirirsin bu yüzden ekleme işlemini öncesinde yayma operatörlü ...tasks ile birlikte köşeli parantez içinde yapmalısın!
        } catch (err) {
            console.error("Task ekleme hatası", err);
            setError("Görev eklenemedi :/");
            alert('Görev Eklenemedi, tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    // Görev düzenleme
    const handleEditTask = async (changes, taskId) => {
        try {
            console.log(`Task'in ${Object.keys(changes)}'ları ${Object.values(changes)} olarak değiştirildi. taskid=${taskId}`);  // sabahtan beri hata alıyorum çünkü Object.argument(changes) diye bir şey yok, Object.values(changes) diye bir şey var ;)
            
            // Backend'e güncelleme gönderme 
            const taskToUpdate = tasks.find(t => t._id === taskId);  // local'deki listede güncellenmek istenen id'ye ait task'in tüm element'leriyle güncel halini çekiyoruz.
            const updatedTask = {...taskToUpdate, ...changes, taskId};
            
            console.log("guncellendi  au:--------------------------------------------------------------", updatedTask);
            // Local state güncellemesiyle ui'de yanıt.
            setTasks(tasks.map(t => 
                t._id === taskId ? updatedTask : t  // map methotu içinde değişkeni veri başlığı(?) olarak kullanmak istiyorsan köşeli paranteze almalısın! 
            ));  // veya           {...t, ...changes} (önceden böyleydi) kullanırsın updatedTask yerine
            await axios.put(`/api/tasks/`, updatedTask);
            
        } catch (err) {
            console.error('Task düzenlenirken hata verdi', err);
            setError('Görev düzenlenemedi :(');
            // window.location.reload();  // gerekli çünküme biz ui'de ekliyoruz ve o anda gitmiyor. bu yüzden sayfa yenilenerek tekrar get isteği gönderiyoruz ve güncellenmediği için eski veri geliyor.
        }
        
    };
    
    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Bu görevi silmek istediğinize emin misiniz?')) {
            try {
                setLoading(true);
                setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));  // her şey şu _id yüzünden geliyor başıma

                await axios.delete('/api/tasks', {data: {_id: taskId}});
            } catch (err) {

            }
        }
    };
    
    // Görevleri status'a göre filtrele, yani tüm görevler tek tabloda toplanmış halde. o zaman bizim yapmamız gereken şey bunları ayıklamak. bu fonksiyon da gerekince bunu yapabilelim diye var. todo'yu görüntülemek istediğimizde status = 'todo' oluyor ve eklemiş oluyoruz.
    const getTaskByStatus = (status) => {
        return tasks.filter((task => task.status === status));  // kanımca bir çözüm olarak .map methodunu şartlı kullanmak'la da olabilirdi
    };
    // useEffect(() => {
    //     const renkVarMi = () => {
    //         const color = (task.color  || (colors[Math.floor(Math.random() * colors.length)]));
    //     };

    //     return () => {
    //         renkVarMi();  // renk yoksa renk atar.
    //     };
    // }, []);

    return (
        <div className="kanban-board">
            <div className="board-title-container">
                <div className="board-title-text">
                    Kanban Board
                </div>
                <button
                    onClick={() => goToMain()}
                >
                    Back
                </button>
            </div>

            <div className="task-lists">
                {['backlog','todo','inprogress','done'].map(listName => (
                    <TaskList
                        key={listName}
                        title={listName === 'backlog' ? "Backlog" : listName === 'todo' ? "To do" : listName === 'inprogress' ? 'In progress' : "Done"}
                        status={listName}
                        tasks={getTaskByStatus(listName)}
                        onAddTask={handleAddTask}
                        onEditTask={handleEditTask}  // girdisiz olarak gider. son varacağı yer olan TaskCard.js'te 2 satır yukarıda gönderilen ve onla gittiği yere kadar gelen task'i, vardığı yerde onClick'e eşitlenirken girdi olarak alır. Aslında 2 satır yukarıda ilgili task'in grup arkadaşları da onla beraberdir. Bir sonraki aşama olan TaskList.js'te bireyselleşir ve tek tek TaskCard.js'in içine gönderilirler.
                        onDeleteTask={handleDeleteTask}  // Yukarıda dediklerimin aynısı delete için de geçerlidir. Tek fark son aşamada onClick'e eşitlenirken handle fonksiyonuna girdi olarak bunca badire atlatıp filtrelene filtrelene gelen task'in bir daha filtrelenmesi sonucu id'sinin alınmasıdır.
                    />
                ))}
            </div>
        </div>
    );
};

// export default KanbanBoard;