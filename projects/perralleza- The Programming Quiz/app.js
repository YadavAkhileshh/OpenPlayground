const { useState, useEffect } = React;

const programmingQuizzes = {
    javascript: {
        name: "JavaScript", icon: "⚡", color: "#f7df1e",
        questions: [
            // 5 hard questions (keeping original)
            {question: "What will `0.1 + 0.2 === 0.3` output?", options:["true","false","undefined","NaN"], correct:1, explanation:"IEEE 754 floating-point precision issue"},
            {question: "`Promise.all([p1,p2])` rejects when?", options:["p1 rejects","p2 rejects","either rejects","both reject"], correct:2, explanation:"Short-circuits on first rejection"},
            {question:"`[1,2,3].map(parseInt)` returns?", options:["[1,2,3]","[1,NaN,NaN]","[1,2,3]","Error"], correct:1, explanation:"Radix parameter causes NaN"},
            {question:"`typeof null` returns?", options:["null","object","undefined","null type"], correct:1, explanation:"Historical JavaScript bug"},
            {question:"`{a:1} == {a:1}`?", options:["true","false","undefined","TypeError"], correct:1, explanation:"Object reference comparison"}
        ]
    },
    python: {
        name: "Python", icon: "🐍", color: "#3776ab",
        questions: [
            {question:"`[[]]*3` append to first grows?", options:["Only first","All lists","Error","Separate"], correct:1, explanation:"Same mutable object reference"},
            {question:"`lambda x:x**2(3)` vs `(lambda x:x**2)(3)`?", options:["Both work","First errors","Second errors","Both error"], correct:1, explanation:"Lambda parsing precedence"},
            {question:"`set([1,2]) | {1,2}` type?", options:["list","set","tuple","Error"], correct:3, explanation:"| requires both sets"},
            {question:"`def f(*args):return args[0]` then `f(1)`?", options:["1","(1,)","Error","None"], correct:1, explanation:"Single arg becomes tuple"},
            {question:"`A().__class__.__bases__[0]()` creates?", options:["A()","object()","TypeError","None"], correct:0, explanation:"Object metaclass instance"}
        ]
    },
    rust: {
        name: "Rust", icon: "🦀", color: "#dea584",
        questions: [
            {question:"`let x=5; let y=&x; *y+=1`?", options:["x=6","Immutable borrow error","Panic","x unchanged"], correct:1, explanation:"Cannot mutate immutable borrow"},
            {question:"`Option::Some(5).unwrap_or_else(||...)`?", options:["5","panic","null deref","compile error"], correct:0, explanation:"Short-circuits on Some"},
            {question:"`let v=vec![1,2,3]; &v[10]`?", options:["IndexError","panic!","null","0"], correct:1, explanation:"Out-of-bounds Vec panic"},
            {question:"`fn f<'a>()->&'a str{let s=String::from(\"hi\"); &s}`?", options:["Compiles","Lifetime error","Borrow error","Both errors"], correct:3, explanation:"Double lifetime violation"},
            {question:"`match Some(5){None=>0,Some(x)if x>10=>1,_=>2}`?", options:["0","1","2","compile error"], correct:2, explanation:"Guard false, wildcard matches"}
        ]
    },
    go: {
        name: "Go", icon: "🐹", color: "#00ADD8",
        questions: [
            {question:"`ch:=make(chan int); go func(){ch<-1}(); <-ch` race?", options:["Always 1","Data race","Deadlock possible","Compile error"], correct:2, explanation:"Goroutine startup race"},
            {question:"`var m map[string]int; m[\"key\"]=1`?", options:["nil map panic","sets value","compile error","key ignored"], correct:0, explanation:"Must initialize nil map"},
            {question:"`defer fmt.Println(1); defer fmt.Println(2)` order?", options:["1 then 2","2 then 1","2 1 2 1","undefined"], correct:1, explanation:"LIFO defer execution"},
            {question:"`s:=[]int{1,2,3}; s=append(s[:1],s[2:]...)`?", options:["[1,2,3]","[1,3]","[1,2]","panic"], correct:1, explanation:"Slice reconstruction"},
            {question:"`select{case<-ch1: case ch2<-x: default:}`?", options:["First ready","Always default","Random","Deadlocks"], correct:0, explanation:"Random ready case selection"}
        ]
    },
    cpp: {
        name: "C++", icon: "⚙️", color: "#00599C",
        questions: [
            {question:"`int* p = new int; delete p; *p = 5;`?", options:["Works","UB","Crash","Compile error"], correct:1, explanation:"Use-after-free undefined behavior"},
            {question:"`vector<int> v(10); v[15] = 1;`?", options:["Crash","UB","0","Compile error"], correct:1, explanation:"No bounds checking on operator[]"},
            {question:"`int x[] = {1,2,3}; int* p = x; p[1]++;` modifies?", options:["x[1]","p[1]","Both","Neither"], correct:0, explanation:"Array decays to pointer"},
            {question:"`std::string s; s[0] = 'a';`?", options:["Works","UB","Crash","Compile error"], correct:3, explanation:"Empty string, no operator[]"},
            {question:"`int&& r = 5; r = 10;`?", options:["Works","Compile error","Runtime error","UB"], correct:0, explanation:"Rvalue ref binds to temporary"}
        ]
    },
    java: {
        name: "Java", icon: "☕", color: "#ED8B00",
        questions: [
            {question:"`String s = new String(\"hi\"); s.intern() == \"hi\".intern();`?", options:["true","false","Compile error","Runtime error"], correct:0, explanation:"Both interned to same String pool"},
            {question:"`int x = 1000; Integer y = x; Integer z = x; y == z;`?", options:["true","false","NullPointer","Compile error"], correct:1, explanation:"Autoboxing cache up to 127"},
            {question:"`List<Integer> list = new ArrayList<>(); list.add(null); list.remove(Integer.valueOf(null));` removes?", options:["Nothing","null","Index 0","Compile error"], correct:0, explanation:"remove(Object) vs remove(index)"},
            {question:"`String s1 = \"a\" + \"b\"; String s2 = \"a\" + \"b\"; s1 == s2;`?", options:["true","false","Runtime dep","Compile error"], correct:0, explanation:"String interning at compile-time"},
            {question:"`Thread t = new Thread(() -> {}); t.start(); t.start();`?", options:["Works","IllegalThreadState","Deadlock","Compile error"], correct:1, explanation:"Cannot restart terminated thread"}
        ]
    },
    typescript: {
        name: "TypeScript", icon: "🔤", color: "#3178C6",
        questions: [
            {question:"`const x: {a: number} = {a: 1, b: 2};`?", options:["Error","Works","Warning","Runtime error"], correct:0, explanation:"Excess property checking"},
            {question:"`type A = {x: number}; type B = A & {y: string};`?", options:["Intersection","Union","Error","Alias"], correct:0, explanation:"Intersection type"},
            {question:"`function f(x: any): any { return x; } f(1).toUpperCase();`?", options:["Compile error","Runtime error","Works","Warning"], correct:1, explanation:"any bypasses type checking"},
            {question:"`const arr: number[] = []; arr.push(1, '2');`?", options:["Error","Works","Warning","Runtime error"], correct:0, explanation:"Array covariance issue"},
            {question:"`type Brand<T, U> = T & { __brand: U };` purpose?", options:["Nominal typing","Union","Intersection","Generic constraint"], correct:0, explanation:"Branded types for nominal typing"}
        ]
    },
    haskell: {
        name: "Haskell", icon: "λ", color: "#5D484C",
        questions: [
            {question:"`let x = 5 in (let x = 10 in x, x)`?", options:["(10,10)","(10,5)","(5,5)","Error"], correct:1, explanation:"Lexical scoping, shadowed"},
            {question:"`[1,2,3] ++ [4,5]` vs `[1,2] ++ [3..5]`?", options:["Same","Different lengths","Error","Runtime error"], correct:1, explanation:"Range creates [3,4,5]"},
            {question:"`(+) <$> (*2) <*> pure 5`?", options:["10","15","Error","Undefined"], correct:0, explanation:"Applicative: 2*5=10 then +10=20? Wait no:"},
            {question:"`foldl (flip (-)) 0 [1,2,3]`?", options:["-6","6","-2","Error"], correct:0, explanation:"(((0-1)-2)-3) = -6"},
            {question:"`data T a = C a (T a) | N deriving Show` infinite?", options:["Yes","No","Compile error","Runtime error"], correct:0, explanation:"Recursive data constructor"}
        ]
    },
    swift: {
        name: "Swift", icon: "🐦", color: "#F05138",
        questions: [
            {question:"`let x = 5; var y = x; y += 1; print(x)`?", options:["6","5","Compile error","Runtime error"], correct:1, explanation:"Value types (structs)"},
            {question:"`class C { var x = 0 }; let c1 = C(); let c2 = c1; c2.x = 1; print(c1.x)`?", options:["1","0","Compile error","Runtime error"], correct:0, explanation:"Reference semantics"},
            {question:"`[1,2,3].compactMap{$0}`?", options:["[1,2,3]","[]","nil","Error"], correct:0, explanation:"Identity compactMap"},
            {question:"`enum E: String { case a = \"A\" }; let e: E = .init(rawValue: \"A\")!`?", options:[".a","nil","Error","Crash"], correct:0, explanation:"RawValue init"},
            {question:"`defer { print(\"a\") }; defer { print(\"b\") }; print(\"c\")`?", options:["cba","cab","abc","bac"], correct:0, explanation:"LIFO defer execution"}
        ]
    },
    kotlin: {
        name: "Kotlin", icon: "🅺", color: "#F44336",
        questions: [
            {question:"`val x = 1; val y = x; y++` modifies?", options:["x","y","Both","Neither"], correct:3, explanation:"val immutable, postfix doesn't assign"},
            {question:"`inline fun <reified T> isA(value: Any) = value is T`?", options:["Works","Compile error","Runtime error","Needs @JvmStatic"], correct:0, explanation:"reified type parameters"},
            {question:"`data class C(val x: Int); val c1 = C(1); val c2 = c1.copy(x = 2); c1 == c2`?", options:["true","false","Compile error","Runtime error"], correct:1, explanation:"Structural equality"},
            {question:"`fun f(x: String?) = x?.length ?: -1` null input?", options:["null","-1","0","Crash"], correct:1, explanation:"Safe call Elvis operator"},
            {question:"`sealed class S; class A: S(); class B: S()` exhaustive `when`?", options:["Needs else","Complete","Compile error","Runtime check"], correct:0, explanation:"Sealed class exhaustiveness"}
        ]
    },
    elixir: {
        name: "Elixir", icon: "💎", color: "#E3372F",
        questions: [
            {question:"`spawn(fn -> receive do: (:EXIT <- pid) -> :ok end end)`?", options:["Link","Monitor","Process dies","Error"], correct:2, explanation:"EXIT signal kills linked process"},
            {question:"`[{1,2},{3,4}] |> Enum.flat_map(&Tuple.to_list/1)`?", options:["[1,2,3,4]","[[1,2],[3,4]]","Error","{1,2,3,4}"], correct:0, explanation:"Flattens nested lists"},
            {question:"`defp f(_), do: :ok; f(1)`?", options:[":ok","undefined","Compile error","Runtime error"], correct:0, explanation:"Private function accessible"},
            {question:"`Process.send_after(self(), :msg, 1000)` cancels with?", options:["Process.cancel","Process.exit",":timer.cancel","Can't cancel"], correct:2, explanation:"Timer reference required"},
            {question:"`{:ok, pid} = Task.start(fn -> :timer.sleep(1000); :done end); Task.await(pid)`?", options:[":ok",":error",":done","Timeout"], correct:3, explanation:"Default 5000ms timeout"}
        ]
    }
};

function App() {
    const [currentLang, setCurrentLang] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        document.body.className = `${theme}-theme`;
    }, [theme]);

    const selectLanguage = (langKey) => {
        setCurrentLang(programmingQuizzes[langKey]);
        setCurrentQuestion(0);
        setAnswers({});
        setShowResult(false);
    };

    const selectAnswer = (index) => {
        setAnswers(prev => ({...prev, [currentQuestion]: index}));
    };

    const nextQuestion = () => {
        if (currentQuestion < currentLang.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setShowResult(true);
        }
    };

    const restartQuiz = () => {
        setCurrentLang(null);
        setCurrentQuestion(0);
        setAnswers({});
        setShowResult(false);
    };

    const calculateScore = () => {
        return Object.values(answers).filter((answer, index) => 
            answer === currentLang.questions[index].correct
        ).length;
    };

    const getRank = (score, total) => {
        const percentage = (score / total) * 100;
        if (percentage === 100) return 'legend';
        if (percentage >= 90) return 'master';
        if (percentage >= 80) return 'expert';
        if (percentage >= 60) return 'pro';
        return 'coder';
    };

    if (!currentLang) {
        return (
            <div className="app-container">
                <header className="header">
                    <h1>🚀 Përrallëza Ultimate</h1>
                    <p>Challenge yourself with 11 programming languages</p>
                </header>
                <div className="quiz-container">
                    <h2 style={{textAlign: 'center', marginBottom: '40px', fontFamily: 'Orbitron'}}>
                        Select Your Programming Arena:
                    </h2>
                    <div className="language-grid">
                        {Object.entries(programmingQuizzes).map(([key, lang]) => (
                            <div 
                                key={key}
                                className="lang-card"
                                data-icon={lang.icon}
                                style={{borderTop: `4px solid ${lang.color}`}}
                                onClick={() => selectLanguage(key)}
                            >
                                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                                    <span style={{fontSize: '2.5rem'}}>{lang.icon}</span>
                                    <div>
                                        <h3>{lang.name}</h3>
                                        <p>{lang.questions.length} expert-level challenges</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (showResult) {
        const score = calculateScore();
        const total = currentLang.questions.length;
        const rankClass = getRank(score, total);

        return (
            <div className="app-container">
                <header className="header">
                    <h1>{currentLang.icon} {currentLang.name} Complete!</h1>
                </header>
                <div className="quiz-container result-container">
                    <div className="score">{score}/{total}</div>
                    <div className={`rank ${rankClass}`}>
                        {score === total ? '🏆 LEGEND' : 
                         score/total >= 0.9 ? '👑 MASTER' : 
                         score/total >= 0.8 ? '⭐ EXPERT' : 
                         score/total >= 0.6 ? '💎 PRO' : '🔥 CODER'}
                    </div>
                    <div style={{margin: '40px 0', fontSize: '1.2rem', maxHeight: '450px', overflowY: 'auto'}}>
                        {currentLang.questions.map((q, index) => (
                            <div key={index} style={{marginBottom: '25px', padding: '20px', background: 'rgba(255,255,255,0.08)', borderRadius: '15px', borderLeft: `4px solid ${answers[index] === q.correct ? '#2ecc71' : '#e74c3c'}`}}>
                                <div style={{fontWeight: 'bold', marginBottom: '10px', fontSize: '1.1rem'}}>
                                    Q{index+1}: {answers[index] === q.correct ? '✅ Correct' : '❌ Wrong'}
                                </div>
                                <div style={{fontSize: '1rem', lineHeight: '1.6'}}>{q.explanation}</div>
                            </div>
                        ))}
                    </div>
                    <div className="controls">
                        <button className="btn btn-secondary" onClick={restartQuiz}>🔄 New Challenge</button>
                        <button className="btn btn-primary" onClick={() => setShowResult(false)}>🔍 Review</button>
                    </div>
                </div>
            </div>
        );
    }

    const question = currentLang.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / currentLang.questions.length) * 100;

    return (
        <div className="app-container">
            <header className="header">
                <h1>{currentLang.icon} {currentLang.name}</h1>
                <p>Question {currentQuestion + 1} of {currentLang.questions.length}</p>
            </header>
            
            <div className="quiz-container">
                <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${progress}%`}}></div>
                </div>

                <div className="question-card">
                    <div className="question-number">Q{currentQuestion + 1}</div>
                    <div className="question-text">{question.question}</div>
                    
                    <div className="options">
                        {question.options.map((option, index) => (
                            <button
                                key={index}
                                className={`option-btn ${answers[currentQuestion] === index ? 'selected' : ''}`}
                                onClick={() => selectAnswer(index)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {answers[currentQuestion] !== undefined && (
                    <div className="controls">
                        <button 
                            className="btn btn-secondary"
                            onClick={() => {
                                const newAnswers = {...answers};
                                delete newAnswers[currentQuestion];
                                setAnswers(newAnswers);
                            }}
                        >
                            ↻ Change Answer
                        </button>
                        <button className="btn btn-primary" onClick={nextQuestion}>
                            {currentQuestion === currentLang.questions.length - 1 ? '🎉 Finish Quiz' : '➡️ Next'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <div>
        <button 
            className="theme-toggle" 
            onClick={() => {
                const body = document.body;
                body.className = body.className.includes('dark') ? 'light-theme' : 'dark-theme';
            }}
        >
            {document.body.className?.includes('dark') ? '☀️' : '🌙'}
        </button>
        <App />
    </div>
);
