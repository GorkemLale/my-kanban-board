import { useState, useEffect } from 'react';
import TaskList from './TaskList';
import './KanbanBoard.css';

function KanbanBoard() {
    const colors = [
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
    const resetColor = () => new Array(colors.length).fill(0);  // [0,0,0,0,0,0,0,0,0] diye array tanımlamak gibi. bu sayede yeni renk ekleyince array'i değiştirmemize gerek kalmayacak. 

    const [colorFarklilastirici, setColorFarklilastirici] = useState(resetColor());
    const [renkSayaci, setRenkSayaci] = useState(0);
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Login sayfası tasarımı', description: 'Kullanıcı girişi için modern tasarım', priority: 'high', status: 'todo', color: "#D93535"},
        { id: 2, title: 'API dokümantasyonu', description: 'REST API endpointleri', priority: 'medium', status: 'todo',color: colors[1] },
        { id: 3, title: 'Database kurulumu', description: 'MongoDB konfigürasyonu', priority: 'high', status: 'inprogress', color: colors[5] },
        { id: 4, title: 'Frontend geliştirme', description: '', priority: '', status: 'done', color: "#D93535" },
        { id: 5, title: 'deneme4', description: 'eneme', priority: 'medium', status: 'todo', color: colors[7] },
        { id: 6, title: 'deneme5', description: 'eneme', priority: 'medium', status: 'todo', color: colors[2] }
    ]);



    // Görevleri status'a göre filtrele, yani tüm görevler tek tabloda toplanmış halde. o zaman bizim yapmamız gereken şey bunları ayıklamak. bu fonksiyon da gerekince bunu yapabilelim diye var. todo'yu görüntülemek istediğimizde status = 'todo' oluyor ve eklemiş oluyoruz.
    const getTaskByStatus = (status) => {
        return tasks.filter((task => task.status === status));
    };

    // Yeni görev ekleme, yani mesela genelde insanlar önce yapılacaklara eklerle ama eklemeyi unuttuğun yapıyor olduğun (inprogress) ve yapıp bitirdiğin (done) işler için de ekleme yapabilr diye bu handle fonskiyon tanımlandı. içine aldığı status'e göre o listeye görev ekliyor. 
    const handleAddTask = (stat, taskTitle) => {
        // const taskTitle = prompt('Görev başlığı girin:');  // pop-up açılır girdi penceresi. input'un penceremsi hali :) 
        console.log("handleAddTask'tayim");
        if (taskTitle  && taskTitle.trim()) {  // hem bir taskTitle gelecek hem de bu task title boşluk string olmayacak. "   " veya " " veya "       " gibi.
            console.log(`Şimdi de task'tayim. ve ${taskTitle} adlı görevi ${stat}'a ekledim `);
            
            while (true) {
                const randomDeger = Math.floor(Math.random() * colors.length);
                const newColor = (colors[randomDeger]);
                console.log(`yeni renk: ${newColor}`);
                console.log(randomDeger, renkSayaci);
                console.log(colorFarklilastirici);
                if (colorFarklilastirici[randomDeger] === 0) {
                    const newTask = {
                        id: Date.now(),  // Basit ID
                        title: taskTitle,
                        description: '',
                        priority: 'medium',
                        status: stat,
                        color: newColor
                    };
                    colorFarklilastirici[randomDeger] = 1;
                    setTasks([newTask, ...tasks]);
                    setRenkSayaci(renkSayaci + 1);
                    break;
                } else {
                    if (renkSayaci >= 9) {  // 9'dan büyük eşittir yaptık çünkü güvenlik için. olur da 9'u anlık geçip de 10 olursa diye yaptık.
                        setRenkSayaci(0);
                        setColorFarklilastirici(resetColor());  // Tek tek [0,0,0,0,0,0,0,0,0] yazmamak için ayrıca sadece renk eklediğimizde diğer değişikliklere gerek kalmayacak ve her şey otomatik olarak halledilecek.
                        break;
                    }
                    continue;
                }

            }
        }
    };

    // Görev düzenleme
    const handleEditTask = (changes, ID) => {
        console.log(`Task'in ${Object.keys(changes)}'ları ${Object.values(changes)} olarak değiştirildi. id=${ID}`);  // sabahtan beri hata alıyorum çünkü Object.argument(changes) diye bir şey yok, Object.values(changes) diye bir şey var ;)
        
        setTasks(tasks.map(t => 
            t.id === ID ? {...t, ...changes} : t  // map methotu içinde değişkeni veri başlığı(?) olarak kullanmak istiyorsan köşeli paranteze almalısın! 
        ));

    };

    const handleDeleteTask = (taskId) => {
        if (window.confirm('Bu görebi silmek istediğinize emin misiniz?')) {
            setTasks(tasks.filter(t => t.id !== taskId));
        }
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
            </div>

            <div className="board-lists">
                {['backlog','todo','inprogress','done'].map(listName => (
                    <TaskList
                        key={listName}
                        title={listName === 'backlog' ? "Backlog" : listName === 'todo' ? "To do" : listName === 'inprogress' ? 'In progress' : "Done"}
                        status={listName}
                        tasks={getTaskByStatus(listName)}
                        onAddTask={handleAddTask}
                        onEditTask={handleEditTask}  // girdisiz olarak gider. son varacağı yer olan TaskCard.js'te 2 satır yukarıda gönderilen ve onla gittiği yere kadar gelen task'i, vardığı yerde onClick'e eşitlenirken girdi olarak alır. Aslında 2 satır yukarıda ilgili task'in grup arkadaşları da onla beraberdir. Bir sonraki aşama olan TaskList.js'te bireyselleşir ve tek tek TaskCard.js'in içine gönderilirler.
                        onDeleteTask={handleDeleteTask}  // Yukarıda dediklerimin aynısı delete için de geçerlidir. Tek fark son aşamada onClick'e eşitlenirken handle fonksiyonuna girdi olarak bunca badire atlatıp filtrelene filtrelene gelen task'in bir daha filtrelenmesi sonucu id'sinin alınmasıdır.
                        // colors={colors}
                    />
                ))}
            </div>
        </div>
    );
};

export default KanbanBoard;