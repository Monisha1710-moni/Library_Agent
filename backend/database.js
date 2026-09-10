// Library Database - Realistic Sample Data with RAG embeddings support
const { v4: uuidv4 } = require('uuid');

const books = [
  {
    id: "b001", isbn: "978-0-13-110362-7", title: "The C Programming Language",
    author: "Brian W. Kernighan, Dennis M. Ritchie", genre: ["Computer Science", "Programming"],
    year: 1988, publisher: "Prentice Hall", edition: "2nd",
    description: "The definitive reference guide to C programming. Written by the creators of C, this book covers the core language, standard library, and advanced features.",
    totalCopies: 5, availableCopies: 2, reservedCopies: 1, borrowedCopies: 2,
    rating: 4.8, reviewCount: 1240, pageCount: 272, language: "English",
    coverColor: "#1a73e8", tags: ["C", "systems programming", "programming languages", "beginner"],
    location: "Shelf A-01", dueDate: null, popular: true, trending: false,
    content: "C programming language pointers memory management functions arrays structures programming paradigms systems low-level"
  },
  {
    id: "b002", isbn: "978-0-13-468599-1", title: "The Pragmatic Programmer",
    author: "David Thomas, Andrew Hunt", genre: ["Software Engineering", "Best Practices"],
    year: 2019, publisher: "Addison-Wesley", edition: "20th Anniversary",
    description: "A guide to becoming a better programmer. Covers practical advice on craftsmanship, debugging, testing, automation, and professional development.",
    totalCopies: 4, availableCopies: 1, reservedCopies: 2, borrowedCopies: 1,
    rating: 4.7, reviewCount: 987, pageCount: 352, language: "English",
    coverColor: "#0d9488", tags: ["software engineering", "best practices", "career", "professional"],
    location: "Shelf A-02", popular: true, trending: true,
    content: "software engineering best practices DRY principle debugging testing automation career development craftsmanship programming"
  },
  {
    id: "b003", isbn: "978-0-13-235088-4", title: "Clean Code",
    author: "Robert C. Martin", genre: ["Software Engineering", "Programming"],
    year: 2008, publisher: "Prentice Hall",
    description: "A handbook of agile software craftsmanship. Teaches how to write readable, maintainable, and clean code with practical examples and refactoring techniques.",
    totalCopies: 6, availableCopies: 3, reservedCopies: 1, borrowedCopies: 2,
    rating: 4.6, reviewCount: 2100, pageCount: 431, language: "English",
    coverColor: "#7c3aed", tags: ["clean code", "refactoring", "Java", "software craftsmanship"],
    location: "Shelf A-03", popular: true, trending: false,
    content: "clean code refactoring naming conventions functions classes error handling unit testing Java software craftsmanship readability"
  },
  {
    id: "b004", isbn: "978-0-596-51774-8", title: "JavaScript: The Good Parts",
    author: "Douglas Crockford", genre: ["Web Development", "Programming"],
    year: 2008, publisher: "O'Reilly Media",
    description: "Distills the language to its essential best features. Covers the good parts of JavaScript — the parts that are reliable, readable, and maintainable.",
    totalCopies: 3, availableCopies: 0, reservedCopies: 1, borrowedCopies: 2,
    rating: 4.4, reviewCount: 876, pageCount: 176, language: "English",
    coverColor: "#d97706", tags: ["JavaScript", "web development", "frontend", "ES5"],
    location: "Shelf B-01", popular: true, trending: false,
    content: "JavaScript functions closures prototypes objects arrays JSON web development frontend ES5 quirks good parts"
  },
  {
    id: "b005", isbn: "978-0-13-235088-5", title: "Introduction to Algorithms",
    author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    genre: ["Computer Science", "Algorithms"],
    year: 2022, publisher: "MIT Press", edition: "4th",
    description: "CLRS is the comprehensive textbook covering algorithms in depth: sorting, searching, graph algorithms, dynamic programming, and complexity theory.",
    totalCopies: 8, availableCopies: 4, reservedCopies: 2, borrowedCopies: 2,
    rating: 4.5, reviewCount: 3200, pageCount: 1292, language: "English",
    coverColor: "#dc2626", tags: ["algorithms", "data structures", "complexity", "CLRS", "computer science"],
    location: "Shelf A-04", popular: true, trending: true,
    content: "algorithms data structures sorting searching graph algorithms dynamic programming greedy algorithms complexity analysis big-O notation"
  },
  {
    id: "b006", isbn: "978-1-491-95035-7", title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann", genre: ["Distributed Systems", "Database"],
    year: 2017, publisher: "O'Reilly Media",
    description: "Big ideas behind reliable, scalable, and maintainable systems. Covers databases, streaming, distributed systems, and data engineering patterns.",
    totalCopies: 4, availableCopies: 2, reservedCopies: 0, borrowedCopies: 2,
    rating: 4.9, reviewCount: 1567, pageCount: 590, language: "English",
    coverColor: "#059669", tags: ["distributed systems", "databases", "scalability", "streaming", "backend"],
    location: "Shelf B-02", popular: true, trending: true,
    content: "databases distributed systems replication partitioning transactions consistency consensus stream processing data engineering scalability reliability"
  },
  {
    id: "b007", isbn: "978-0-13-110362-8", title: "Deep Learning",
    author: "Ian Goodfellow, Yoshua Bengio, Aaron Courville",
    genre: ["Artificial Intelligence", "Machine Learning"],
    year: 2016, publisher: "MIT Press",
    description: "The definitive textbook on deep learning. Covers neural networks, optimization, convolutional networks, recurrent networks, and generative models.",
    totalCopies: 5, availableCopies: 1, reservedCopies: 3, borrowedCopies: 1,
    rating: 4.7, reviewCount: 1890, pageCount: 775, language: "English",
    coverColor: "#7c3aed", tags: ["deep learning", "neural networks", "AI", "machine learning", "CNN", "RNN"],
    location: "Shelf C-01", popular: true, trending: true,
    content: "deep learning neural networks backpropagation convolutional networks recurrent networks LSTM generative models optimization machine learning AI"
  },
  {
    id: "b008", isbn: "978-1-491-91205-8", title: "Python for Data Analysis",
    author: "Wes McKinney", genre: ["Data Science", "Python"],
    year: 2022, publisher: "O'Reilly Media", edition: "3rd",
    description: "Practical data manipulation and analysis with pandas, NumPy, and Jupyter. The authoritative guide to Python's data ecosystem.",
    totalCopies: 6, availableCopies: 3, reservedCopies: 1, borrowedCopies: 2,
    rating: 4.5, reviewCount: 1120, pageCount: 548, language: "English",
    coverColor: "#2563eb", tags: ["Python", "pandas", "NumPy", "data analysis", "data science"],
    location: "Shelf C-02", popular: false, trending: true,
    content: "Python pandas NumPy data analysis data manipulation Jupyter notebook matplotlib data science statistical analysis"
  },
  {
    id: "b009", isbn: "978-0-13-439436-7", title: "Computer Networks",
    author: "Andrew S. Tanenbaum, David J. Wetherall",
    genre: ["Networking", "Computer Science"],
    year: 2010, publisher: "Prentice Hall", edition: "5th",
    description: "Comprehensive coverage of computer networking from physical layer to application layer. Covers TCP/IP, protocols, security, and multimedia networking.",
    totalCopies: 4, availableCopies: 2, reservedCopies: 0, borrowedCopies: 2,
    rating: 4.4, reviewCount: 780, pageCount: 960, language: "English",
    coverColor: "#0891b2", tags: ["networking", "TCP/IP", "protocols", "computer networks", "OSI model"],
    location: "Shelf A-05", popular: false, trending: false,
    content: "computer networks TCP/IP protocols OSI model routing switching wireless networks security application layer HTTP DNS"
  },
  {
    id: "b010", isbn: "978-0-13-468599-2", title: "Operating System Concepts",
    author: "Abraham Silberschatz, Peter B. Galvin, Greg Gagne",
    genre: ["Operating Systems", "Computer Science"],
    year: 2018, publisher: "Wiley", edition: "10th",
    description: "The definitive OS textbook covering processes, threads, memory management, file systems, I/O, and security in modern operating systems.",
    totalCopies: 7, availableCopies: 4, reservedCopies: 1, borrowedCopies: 2,
    rating: 4.3, reviewCount: 1450, pageCount: 976, language: "English",
    coverColor: "#b45309", tags: ["operating systems", "processes", "memory management", "file systems", "Linux"],
    location: "Shelf A-06", popular: false, trending: false,
    content: "operating systems processes threads memory management virtual memory file systems I/O deadlocks scheduling synchronization Linux Unix"
  },
  {
    id: "b011", isbn: "978-0-13-235088-6", title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell, Peter Norvig",
    genre: ["Artificial Intelligence", "Computer Science"],
    year: 2020, publisher: "Pearson", edition: "4th",
    description: "The most widely used AI textbook. Covers search, knowledge representation, planning, machine learning, natural language processing, and robotics.",
    totalCopies: 6, availableCopies: 2, reservedCopies: 2, borrowedCopies: 2,
    rating: 4.8, reviewCount: 2300, pageCount: 1132, language: "English",
    coverColor: "#0d9488", tags: ["AI", "artificial intelligence", "machine learning", "NLP", "planning"],
    location: "Shelf C-03", popular: true, trending: true,
    content: "artificial intelligence search algorithms knowledge representation machine learning neural networks natural language processing robotics planning"
  },
  {
    id: "b012", isbn: "978-1-617-29411-1", title: "Grokking Algorithms",
    author: "Aditya Y. Bhargava", genre: ["Algorithms", "Computer Science"],
    year: 2016, publisher: "Manning Publications",
    description: "An illustrated guide to algorithms for programmers and curious people. Uses visual examples to explain complex algorithms simply.",
    totalCopies: 5, availableCopies: 3, reservedCopies: 0, borrowedCopies: 2,
    rating: 4.6, reviewCount: 1560, pageCount: 256, language: "English",
    coverColor: "#f59e0b", tags: ["algorithms", "beginners", "visual", "data structures", "easy"],
    location: "Shelf A-07", popular: true, trending: false,
    content: "algorithms binary search recursion quicksort graphs breadth-first search dynamic programming visual illustrations beginners"
  },
  {
    id: "b013", isbn: "978-0-13-468599-3", title: "Database System Concepts",
    author: "Abraham Silberschatz, Henry F. Korth, S. Sudarshan",
    genre: ["Database", "Computer Science"],
    year: 2019, publisher: "McGraw-Hill", edition: "7th",
    description: "Comprehensive textbook on database management systems. Covers relational model, SQL, normalization, transactions, and NoSQL databases.",
    totalCopies: 5, availableCopies: 2, reservedCopies: 1, borrowedCopies: 2,
    rating: 4.4, reviewCount: 920, pageCount: 1376, language: "English",
    coverColor: "#16a34a", tags: ["database", "SQL", "DBMS", "normalization", "transactions", "NoSQL"],
    location: "Shelf B-03", popular: false, trending: false,
    content: "database SQL relational model normalization transactions ACID DBMS NoSQL MongoDB indexing query optimization"
  },
  {
    id: "b014", isbn: "978-1-491-95034-0", title: "Hands-On Machine Learning",
    author: "Aurélien Géron", genre: ["Machine Learning", "Data Science"],
    year: 2022, publisher: "O'Reilly Media", edition: "3rd",
    description: "Practical machine learning with Scikit-Learn, Keras, and TensorFlow. Covers classification, regression, clustering, and deep neural networks.",
    totalCopies: 6, availableCopies: 1, reservedCopies: 3, borrowedCopies: 2,
    rating: 4.8, reviewCount: 2780, pageCount: 851, language: "English",
    coverColor: "#dc2626", tags: ["machine learning", "TensorFlow", "Keras", "scikit-learn", "Python", "deep learning"],
    location: "Shelf C-04", popular: true, trending: true,
    content: "machine learning scikit-learn TensorFlow Keras classification regression clustering neural networks deep learning Python practical"
  },
  {
    id: "b015", isbn: "978-0-13-235088-7", title: "Design Patterns",
    author: "Gang of Four (GoF)", genre: ["Software Engineering", "Design Patterns"],
    year: 1994, publisher: "Addison-Wesley",
    description: "Elements of reusable object-oriented software. The classic reference for 23 design patterns including creational, structural, and behavioral patterns.",
    totalCopies: 4, availableCopies: 2, reservedCopies: 1, borrowedCopies: 1,
    rating: 4.5, reviewCount: 1870, pageCount: 395, language: "English",
    coverColor: "#6d28d9", tags: ["design patterns", "OOP", "object-oriented", "software architecture", "GoF"],
    location: "Shelf A-08", popular: true, trending: false,
    content: "design patterns singleton factory observer strategy decorator adapter composite command object-oriented programming software architecture"
  },
  {
    id: "b016", isbn: "978-1-491-91205-9", title: "You Don't Know JS Yet",
    author: "Kyle Simpson", genre: ["JavaScript", "Web Development"],
    year: 2020, publisher: "O'Reilly Media",
    description: "In-depth exploration of JavaScript's core mechanisms. Covers scope, closures, this keyword, prototypes, types, and async patterns deeply.",
    totalCopies: 3, availableCopies: 2, reservedCopies: 0, borrowedCopies: 1,
    rating: 4.6, reviewCount: 1130, pageCount: 278, language: "English",
    coverColor: "#f59e0b", tags: ["JavaScript", "closures", "this", "async", "web development"],
    location: "Shelf B-04", popular: false, trending: true,
    content: "JavaScript scope closures this prototype async await promises generators iterators ES6 modules web development"
  },
  {
    id: "b017", isbn: "978-0-13-439436-8", title: "Computer Organization and Design",
    author: "David A. Patterson, John L. Hennessy",
    genre: ["Computer Architecture", "Hardware"],
    year: 2020, publisher: "Morgan Kaufmann", edition: "5th",
    description: "The hardware/software interface, covering RISC-V architecture, assembly language, pipelining, memory hierarchy, and parallel processors.",
    totalCopies: 4, availableCopies: 3, reservedCopies: 0, borrowedCopies: 1,
    rating: 4.3, reviewCount: 650, pageCount: 696, language: "English",
    coverColor: "#374151", tags: ["computer architecture", "RISC-V", "assembly", "hardware", "pipelining"],
    location: "Shelf D-01", popular: false, trending: false,
    content: "computer architecture RISC-V assembly language instruction set pipelining memory hierarchy cache parallel processors hardware"
  },
  {
    id: "b018", isbn: "978-1-617-29411-2", title: "React: Up and Running",
    author: "Stoyan Stefanov", genre: ["Web Development", "JavaScript"],
    year: 2022, publisher: "O'Reilly Media",
    description: "Build modern web apps with React. Covers components, hooks, state management, context, React Router, and testing React applications.",
    totalCopies: 4, availableCopies: 3, reservedCopies: 0, borrowedCopies: 1,
    rating: 4.3, reviewCount: 560, pageCount: 222, language: "English",
    coverColor: "#0ea5e9", tags: ["React", "JavaScript", "frontend", "hooks", "web development"],
    location: "Shelf B-05", popular: false, trending: true,
    content: "React components hooks useState useEffect state management context API React Router testing JSX frontend web development"
  },
  {
    id: "b019", isbn: "978-0-596-51774-9", title: "Clean Architecture",
    author: "Robert C. Martin", genre: ["Software Engineering", "Architecture"],
    year: 2017, publisher: "Prentice Hall",
    description: "A craftsman's guide to software structure and design. Covers SOLID principles, component principles, and architectural patterns for scalable systems.",
    totalCopies: 4, availableCopies: 2, reservedCopies: 1, borrowedCopies: 1,
    rating: 4.5, reviewCount: 1340, pageCount: 432, language: "English",
    coverColor: "#be185d", tags: ["architecture", "SOLID", "design principles", "clean code", "software engineering"],
    location: "Shelf A-09", popular: true, trending: false,
    content: "software architecture SOLID principles clean architecture dependency rule component design boundaries layers use cases entities"
  },
  {
    id: "b020", isbn: "978-1-617-29411-3", title: "Docker Deep Dive",
    author: "Nigel Poulton", genre: ["DevOps", "Cloud Computing"],
    year: 2023, publisher: "Self-Published",
    description: "A comprehensive guide to Docker containerization. Covers images, containers, networking, volumes, Docker Compose, and Docker Swarm.",
    totalCopies: 3, availableCopies: 2, reservedCopies: 0, borrowedCopies: 1,
    rating: 4.4, reviewCount: 890, pageCount: 208, language: "English",
    coverColor: "#0284c7", tags: ["Docker", "containers", "DevOps", "cloud", "Kubernetes"],
    location: "Shelf D-02", popular: false, trending: true,
    content: "Docker containers images networking volumes Docker Compose DevOps cloud Kubernetes containerization microservices"
  }
];

const students = [
  {
    id: "s001", studentId: "CS2021001", name: "Alice Johnson", email: "alice.j@university.edu",
    department: "Computer Science", year: 3, gpa: 3.8,
    borrowedBooks: ["b001", "b007"], reservedBooks: ["b014"],
    waitlist: [], borrowHistory: ["b003", "b005", "b011", "b015"],
    interests: ["AI", "Machine Learning", "Python", "Algorithms"],
    avatar: "AJ", joinDate: "2021-08-15", totalBorrowed: 6, overdueCount: 0,
    membershipType: "Premium", points: 450
  },
  {
    id: "s002", studentId: "CS2022045", name: "Bob Martinez", email: "bob.m@university.edu",
    department: "Computer Science", year: 2, gpa: 3.5,
    borrowedBooks: ["b004", "b016"], reservedBooks: ["b002"],
    waitlist: [], borrowHistory: ["b003", "b012"],
    interests: ["Web Development", "JavaScript", "React", "Node.js"],
    avatar: "BM", joinDate: "2022-08-20", totalBorrowed: 4, overdueCount: 0,
    membershipType: "Standard", points: 210
  },
  {
    id: "s003", studentId: "DS2023012", name: "Carol Chen", email: "carol.c@university.edu",
    department: "Data Science", year: 1, gpa: 3.9,
    borrowedBooks: ["b008"], reservedBooks: ["b014"],
    waitlist: ["b007"], borrowHistory: ["b005"],
    interests: ["Data Science", "Machine Learning", "Statistics", "Python"],
    avatar: "CC", joinDate: "2023-08-10", totalBorrowed: 2, overdueCount: 0,
    membershipType: "Standard", points: 130
  }
];

const reservations = [
  {
    id: "r001", bookId: "b014", studentId: "s001", studentName: "Alice Johnson",
    bookTitle: "Hands-On Machine Learning",
    reservedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active", position: 1
  },
  {
    id: "r002", bookId: "b002", studentId: "s002", studentName: "Bob Martinez",
    bookTitle: "The Pragmatic Programmer",
    reservedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active", position: 1
  }
];

const borrowings = [
  {
    id: "br001", bookId: "b001", studentId: "s001", studentName: "Alice Johnson",
    bookTitle: "The C Programming Language",
    borrowDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: null, status: "borrowed", renewCount: 0
  },
  {
    id: "br002", bookId: "b007", studentId: "s001", studentName: "Alice Johnson",
    bookTitle: "Deep Learning",
    borrowDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: null, status: "borrowed", renewCount: 0
  },
  {
    id: "br003", bookId: "b004", studentId: "s002", studentName: "Bob Martinez",
    bookTitle: "JavaScript: The Good Parts",
    borrowDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: null, status: "borrowed", renewCount: 1
  },
  {
    id: "br004", bookId: "b008", studentId: "s003", studentName: "Carol Chen",
    bookTitle: "Python for Data Analysis",
    borrowDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: null, status: "borrowed", renewCount: 0
  }
];

// Simple keyword-based RAG for embedding search
function computeRelevance(book, query) {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(t => t.length > 2);
  let score = 0;
  const searchText = `${book.title} ${book.author} ${book.content} ${book.tags.join(' ')} ${book.genre.join(' ')} ${book.description}`.toLowerCase();
  
  terms.forEach(term => {
    if (book.title.toLowerCase().includes(term)) score += 10;
    if (book.author.toLowerCase().includes(term)) score += 6;
    if (book.tags.some(t => t.toLowerCase().includes(term))) score += 8;
    if (book.genre.some(g => g.toLowerCase().includes(term))) score += 7;
    if (book.content.toLowerCase().includes(term)) score += 4;
    if (book.description.toLowerCase().includes(term)) score += 3;
  });
  
  // Boost popular & trending
  if (book.popular) score += 2;
  if (book.trending) score += 1;
  
  return score;
}

function ragSearch(query, topK = 10) {
  const scored = books.map(b => ({ ...b, relevanceScore: computeRelevance(b, query) }));
  return scored.filter(b => b.relevanceScore > 0).sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, topK);
}

function getRecommendations(student, count = 6) {
  const interests = student.interests || [];
  const borrowed = [...student.borrowedBooks, ...student.borrowHistory];
  
  const scored = books
    .filter(b => !borrowed.includes(b.id))
    .map(b => {
      let score = computeRelevance(b, interests.join(' '));
      if (b.popular) score += 5;
      if (b.trending) score += 3;
      return { ...b, relevanceScore: score };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  return scored.slice(0, count);
}

function getPopularBooks(count = 8) {
  return books
    .filter(b => b.popular || b.trending)
    .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
    .slice(0, count);
}

module.exports = {
  books,
  students,
  reservations,
  borrowings,
  ragSearch,
  getRecommendations,
  getPopularBooks,
  computeRelevance
};
