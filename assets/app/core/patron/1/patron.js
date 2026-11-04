/*
 * djc-core-patron (v1): visor de patrones de texto (triángulos de asteriscos).
 * Eliges el tipo y el tamaño y ves al momento lo que imprime el programa y
 * su código. Ver docs/ui.md.
 *
 *   <div class="djc-core-patron" data-djc-core-patron-lenguaje="python"></div>
 *
 * Opcional: data-djc-core-patron-tipos="rectangulo,piramide" (cuáles mostrar,
 * en ese orden) y data-djc-core-patron-tamano="5".
 *
 * La salida se calcula aquí, en JavaScript, igual que la imprime el programa;
 * el código que se muestra es el del lenguaje elegido. Para sumar un lenguaje
 * se agrega su código en CODIGO (en sus dos versiones de nombres).
 */
(function () {
  'use strict';

  var P = 'djc-core-patron';
  var MIN = 1;
  var MAX = 12;

  function rep(t, n) { return n > 0 ? new Array(n + 1).join(t) : ''; }

  /* Cada generador devuelve las líneas, igual que el programa. */
  var GENERAR = {
    rectangulo: function (n) { var l = []; for (var i = 1; i <= n; i++) l.push(rep('*', i)); return l; },
    invertido: function (n) { var l = []; for (var i = n; i >= 1; i--) l.push(rep('*', i)); return l; },
    derecha: function (n) { var l = []; for (var i = 1; i <= n; i++) l.push(rep(' ', n - i) + rep('*', i)); return l; },
    piramide: function (n) { var l = []; for (var i = 1; i <= n; i++) l.push(rep(' ', n - i) + rep('*', 2 * i - 1)); return l; },
    hueco: function (n) {
      var l = [];
      for (var i = 1; i <= n; i++) {
        if (i === 1) l.push(rep(' ', n - 1) + '*');
        else if (i === n) l.push(rep('*', 2 * n - 1));
        else l.push(rep(' ', n - i) + '*' + rep(' ', 2 * i - 3) + '*');
      }
      return l;
    },
    numeros: function (n) {
      var l = [];
      for (var i = 1; i <= n; i++) { var f = []; for (var j = 1; j <= i; j++) f.push(String(j)); l.push(f.join(' ')); }
      return l;
    },
    pascal: function (n) {
      var l = []; var fila = [1];
      for (var i = 0; i < n; i++) {
        l.push(rep(' ', n - i - 1) + fila.join(' '));
        var nueva = [1];
        for (var k = 0; k < fila.length - 1; k++) nueva.push(fila[k] + fila[k + 1]);
        nueva.push(1);
        fila = nueva;
      }
      return l;
    },
    sierpinski: function (n) {
      var l = [];
      for (var i = 0; i < n; i++) {
        var f = [];
        for (var j = 0; j <= i; j++) f.push((j & i) === j ? '*' : ' ');
        l.push(rep(' ', n - i - 1) + f.join(' '));
      }
      return l;
    }
  };

  /*
   * El código de cada tipo, por lenguaje y por idioma de los nombres: "es"
   * para la página en español (fila, nueva) y "en" para inglés y chino
   * (row, next). Se comprobó que cada uno imprime lo mismo que GENERAR, para
   * los tamaños del 1 al 12. La línea con n = ... fija el tamaño.
   */
  var CODIGO = {
    es: {
      python: {
        rectangulo: "n = 5\nfor i in range(1, n + 1):\n    print(\"*\" * i)",
        invertido: "n = 5\nfor i in range(n, 0, -1):\n    print(\"*\" * i)",
        derecha: "n = 5\nfor i in range(1, n + 1):\n    print(\" \" * (n - i) + \"*\" * i)",
        piramide: "n = 5\nfor i in range(1, n + 1):\n    print(\" \" * (n - i) + \"*\" * (2 * i - 1))",
        hueco: "n = 5\nfor i in range(1, n + 1):\n    if i == 1:\n        print(\" \" * (n - 1) + \"*\")\n    elif i == n:\n        print(\"*\" * (2 * n - 1))\n    else:\n        print(\" \" * (n - i) + \"*\" + \" \" * (2 * i - 3) + \"*\")",
        numeros: "n = 5\nfor i in range(1, n + 1):\n    print(\" \".join(str(j) for j in range(1, i + 1)))",
        pascal: "n = 5\nfila = [1]\nfor i in range(n):\n    print(\" \" * (n - i - 1) + \" \".join(str(x) for x in fila))\n    fila = [1] + [fila[k] + fila[k + 1] for k in range(len(fila) - 1)] + [1]",
        sierpinski: "n = 8\nfor i in range(n):\n    fila = [\"*\" if (j & i) == j else \" \" for j in range(i + 1)]\n    print(\" \" * (n - i - 1) + \" \".join(fila))"
      },
      javascript: {
        rectangulo: "const n = 5;\nfor (let i = 1; i <= n; i++) {\n  console.log(\"*\".repeat(i));\n}",
        invertido: "const n = 5;\nfor (let i = n; i >= 1; i--) {\n  console.log(\"*\".repeat(i));\n}",
        derecha: "const n = 5;\nfor (let i = 1; i <= n; i++) {\n  console.log(\" \".repeat(n - i) + \"*\".repeat(i));\n}",
        piramide: "const n = 5;\nfor (let i = 1; i <= n; i++) {\n  console.log(\" \".repeat(n - i) + \"*\".repeat(2 * i - 1));\n}",
        hueco: "const n = 5;\nfor (let i = 1; i <= n; i++) {\n  if (i === 1) {\n    console.log(\" \".repeat(n - 1) + \"*\");\n  } else if (i === n) {\n    console.log(\"*\".repeat(2 * n - 1));\n  } else {\n    console.log(\" \".repeat(n - i) + \"*\" + \" \".repeat(2 * i - 3) + \"*\");\n  }\n}",
        numeros: "const n = 5;\nfor (let i = 1; i <= n; i++) {\n  const nums = [];\n  for (let j = 1; j <= i; j++) {\n    nums.push(j);\n  }\n  console.log(nums.join(\" \"));\n}",
        pascal: "const n = 5;\nlet fila = [1];\nfor (let i = 0; i < n; i++) {\n  console.log(\" \".repeat(n - i - 1) + fila.join(\" \"));\n  const nueva = [1];\n  for (let k = 0; k < fila.length - 1; k++) {\n    nueva.push(fila[k] + fila[k + 1]);\n  }\n  nueva.push(1);\n  fila = nueva;\n}",
        sierpinski: "const n = 8;\nfor (let i = 0; i < n; i++) {\n  const fila = [];\n  for (let j = 0; j <= i; j++) {\n    fila.push((j & i) === j ? \"*\" : \" \");\n  }\n  console.log(\" \".repeat(n - i - 1) + fila.join(\" \"));\n}"
      },
      rust: {
        rectangulo: "fn main() {\n    let n = 5;\n    for i in 1..=n {\n        println!(\"{}\", \"*\".repeat(i));\n    }\n}",
        invertido: "fn main() {\n    let n = 5;\n    for i in (1..=n).rev() {\n        println!(\"{}\", \"*\".repeat(i));\n    }\n}",
        derecha: "fn main() {\n    let n = 5;\n    for i in 1..=n {\n        println!(\"{}{}\", \" \".repeat(n - i), \"*\".repeat(i));\n    }\n}",
        piramide: "fn main() {\n    let n = 5;\n    for i in 1..=n {\n        println!(\"{}{}\", \" \".repeat(n - i), \"*\".repeat(2 * i - 1));\n    }\n}",
        hueco: "fn main() {\n    let n = 5;\n    for i in 1..=n {\n        if i == 1 {\n            println!(\"{}*\", \" \".repeat(n - 1));\n        } else if i == n {\n            println!(\"{}\", \"*\".repeat(2 * n - 1));\n        } else {\n            println!(\"{}*{}*\", \" \".repeat(n - i), \" \".repeat(2 * i - 3));\n        }\n    }\n}",
        numeros: "fn main() {\n    let n = 5;\n    for i in 1..=n {\n        let nums: Vec<String> = (1..=i).map(|j| j.to_string()).collect();\n        println!(\"{}\", nums.join(\" \"));\n    }\n}",
        pascal: "fn main() {\n    let n = 5;\n    let mut fila: Vec<u64> = vec![1];\n    for i in 0..n {\n        let texto: Vec<String> = fila.iter().map(|x| x.to_string()).collect();\n        println!(\"{}{}\", \" \".repeat(n - i - 1), texto.join(\" \"));\n        let mut nueva = vec![1];\n        for k in 0..fila.len() - 1 {\n            nueva.push(fila[k] + fila[k + 1]);\n        }\n        nueva.push(1);\n        fila = nueva;\n    }\n}",
        sierpinski: "fn main() {\n    let n = 8;\n    for i in 0..n {\n        let fila: Vec<&str> = (0..=i).map(|j| if (j & i) == j { \"*\" } else { \" \" }).collect();\n        println!(\"{}{}\", \" \".repeat(n - i - 1), fila.join(\" \"));\n    }\n}"
      },
      cpp: {
        rectangulo: "#include <iostream>\n#include <string>\n\nint main() {\n    int n = 5;\n    for (int i = 1; i <= n; i++) {\n        std::cout << std::string(i, '*') << \"\\n\";\n    }\n}",
        invertido: "#include <iostream>\n#include <string>\n\nint main() {\n    int n = 5;\n    for (int i = n; i >= 1; i--) {\n        std::cout << std::string(i, '*') << \"\\n\";\n    }\n}",
        derecha: "#include <iostream>\n#include <string>\n\nint main() {\n    int n = 5;\n    for (int i = 1; i <= n; i++) {\n        std::cout << std::string(n - i, ' ') << std::string(i, '*') << \"\\n\";\n    }\n}",
        piramide: "#include <iostream>\n#include <string>\n\nint main() {\n    int n = 5;\n    for (int i = 1; i <= n; i++) {\n        std::cout << std::string(n - i, ' ') << std::string(2 * i - 1, '*') << \"\\n\";\n    }\n}",
        hueco: "#include <iostream>\n#include <string>\n\nint main() {\n    int n = 5;\n    for (int i = 1; i <= n; i++) {\n        if (i == 1) {\n            std::cout << std::string(n - 1, ' ') << \"*\\n\";\n        } else if (i == n) {\n            std::cout << std::string(2 * n - 1, '*') << \"\\n\";\n        } else {\n            std::cout << std::string(n - i, ' ') << \"*\" << std::string(2 * i - 3, ' ') << \"*\\n\";\n        }\n    }\n}",
        numeros: "#include <iostream>\n#include <string>\n\nint main() {\n    int n = 5;\n    for (int i = 1; i <= n; i++) {\n        for (int j = 1; j <= i; j++) {\n            if (j > 1) std::cout << \" \";\n            std::cout << j;\n        }\n        std::cout << \"\\n\";\n    }\n}",
        pascal: "#include <iostream>\n#include <string>\n#include <vector>\n\nint main() {\n    int n = 5;\n    std::vector<long long> fila = {1};\n    for (int i = 0; i < n; i++) {\n        std::cout << std::string(n - i - 1, ' ');\n        for (size_t k = 0; k < fila.size(); k++) {\n            if (k > 0) std::cout << \" \";\n            std::cout << fila[k];\n        }\n        std::cout << \"\\n\";\n        std::vector<long long> nueva = {1};\n        for (size_t k = 0; k + 1 < fila.size(); k++) {\n            nueva.push_back(fila[k] + fila[k + 1]);\n        }\n        nueva.push_back(1);\n        fila = nueva;\n    }\n}",
        sierpinski: "#include <iostream>\n#include <string>\n\nint main() {\n    int n = 8;\n    for (int i = 0; i < n; i++) {\n        std::cout << std::string(n - i - 1, ' ');\n        for (int j = 0; j <= i; j++) {\n            if (j > 0) std::cout << \" \";\n            std::cout << ((j & i) == j ? \"*\" : \" \");\n        }\n        std::cout << \"\\n\";\n    }\n}"
      }
    },
    en: {
      python: {
        rectangulo: "n = 5\nfor i in range(1, n + 1):\n    print(\"*\" * i)",
        invertido: "n = 5\nfor i in range(n, 0, -1):\n    print(\"*\" * i)",
        derecha: "n = 5\nfor i in range(1, n + 1):\n    print(\" \" * (n - i) + \"*\" * i)",
        piramide: "n = 5\nfor i in range(1, n + 1):\n    print(\" \" * (n - i) + \"*\" * (2 * i - 1))",
        hueco: "n = 5\nfor i in range(1, n + 1):\n    if i == 1:\n        print(\" \" * (n - 1) + \"*\")\n    elif i == n:\n        print(\"*\" * (2 * n - 1))\n    else:\n        print(\" \" * (n - i) + \"*\" + \" \" * (2 * i - 3) + \"*\")",
        numeros: "n = 5\nfor i in range(1, n + 1):\n    print(\" \".join(str(j) for j in range(1, i + 1)))",
        pascal: "n = 5\nrow = [1]\nfor i in range(n):\n    print(\" \" * (n - i - 1) + \" \".join(str(x) for x in row))\n    row = [1] + [row[k] + row[k + 1] for k in range(len(row) - 1)] + [1]",
        sierpinski: "n = 8\nfor i in range(n):\n    row = [\"*\" if (j & i) == j else \" \" for j in range(i + 1)]\n    print(\" \" * (n - i - 1) + \" \".join(row))"
      },
      javascript: {
        rectangulo: "const n = 5;\nfor (let i = 1; i <= n; i++) {\n  console.log(\"*\".repeat(i));\n}",
        invertido: "const n = 5;\nfor (let i = n; i >= 1; i--) {\n  console.log(\"*\".repeat(i));\n}",
        derecha: "const n = 5;\nfor (let i = 1; i <= n; i++) {\n  console.log(\" \".repeat(n - i) + \"*\".repeat(i));\n}",
        piramide: "const n = 5;\nfor (let i = 1; i <= n; i++) {\n  console.log(\" \".repeat(n - i) + \"*\".repeat(2 * i - 1));\n}",
        hueco: "const n = 5;\nfor (let i = 1; i <= n; i++) {\n  if (i === 1) {\n    console.log(\" \".repeat(n - 1) + \"*\");\n  } else if (i === n) {\n    console.log(\"*\".repeat(2 * n - 1));\n  } else {\n    console.log(\" \".repeat(n - i) + \"*\" + \" \".repeat(2 * i - 3) + \"*\");\n  }\n}",
        numeros: "const n = 5;\nfor (let i = 1; i <= n; i++) {\n  const nums = [];\n  for (let j = 1; j <= i; j++) {\n    nums.push(j);\n  }\n  console.log(nums.join(\" \"));\n}",
        pascal: "const n = 5;\nlet row = [1];\nfor (let i = 0; i < n; i++) {\n  console.log(\" \".repeat(n - i - 1) + row.join(\" \"));\n  const next = [1];\n  for (let k = 0; k < row.length - 1; k++) {\n    next.push(row[k] + row[k + 1]);\n  }\n  next.push(1);\n  row = next;\n}",
        sierpinski: "const n = 8;\nfor (let i = 0; i < n; i++) {\n  const row = [];\n  for (let j = 0; j <= i; j++) {\n    row.push((j & i) === j ? \"*\" : \" \");\n  }\n  console.log(\" \".repeat(n - i - 1) + row.join(\" \"));\n}"
      },
      rust: {
        rectangulo: "fn main() {\n    let n = 5;\n    for i in 1..=n {\n        println!(\"{}\", \"*\".repeat(i));\n    }\n}",
        invertido: "fn main() {\n    let n = 5;\n    for i in (1..=n).rev() {\n        println!(\"{}\", \"*\".repeat(i));\n    }\n}",
        derecha: "fn main() {\n    let n = 5;\n    for i in 1..=n {\n        println!(\"{}{}\", \" \".repeat(n - i), \"*\".repeat(i));\n    }\n}",
        piramide: "fn main() {\n    let n = 5;\n    for i in 1..=n {\n        println!(\"{}{}\", \" \".repeat(n - i), \"*\".repeat(2 * i - 1));\n    }\n}",
        hueco: "fn main() {\n    let n = 5;\n    for i in 1..=n {\n        if i == 1 {\n            println!(\"{}*\", \" \".repeat(n - 1));\n        } else if i == n {\n            println!(\"{}\", \"*\".repeat(2 * n - 1));\n        } else {\n            println!(\"{}*{}*\", \" \".repeat(n - i), \" \".repeat(2 * i - 3));\n        }\n    }\n}",
        numeros: "fn main() {\n    let n = 5;\n    for i in 1..=n {\n        let nums: Vec<String> = (1..=i).map(|j| j.to_string()).collect();\n        println!(\"{}\", nums.join(\" \"));\n    }\n}",
        pascal: "fn main() {\n    let n = 5;\n    let mut row: Vec<u64> = vec![1];\n    for i in 0..n {\n        let text: Vec<String> = row.iter().map(|x| x.to_string()).collect();\n        println!(\"{}{}\", \" \".repeat(n - i - 1), text.join(\" \"));\n        let mut next = vec![1];\n        for k in 0..row.len() - 1 {\n            next.push(row[k] + row[k + 1]);\n        }\n        next.push(1);\n        row = next;\n    }\n}",
        sierpinski: "fn main() {\n    let n = 8;\n    for i in 0..n {\n        let row: Vec<&str> = (0..=i).map(|j| if (j & i) == j { \"*\" } else { \" \" }).collect();\n        println!(\"{}{}\", \" \".repeat(n - i - 1), row.join(\" \"));\n    }\n}"
      },
      cpp: {
        rectangulo: "#include <iostream>\n#include <string>\n\nint main() {\n    int n = 5;\n    for (int i = 1; i <= n; i++) {\n        std::cout << std::string(i, '*') << \"\\n\";\n    }\n}",
        invertido: "#include <iostream>\n#include <string>\n\nint main() {\n    int n = 5;\n    for (int i = n; i >= 1; i--) {\n        std::cout << std::string(i, '*') << \"\\n\";\n    }\n}",
        derecha: "#include <iostream>\n#include <string>\n\nint main() {\n    int n = 5;\n    for (int i = 1; i <= n; i++) {\n        std::cout << std::string(n - i, ' ') << std::string(i, '*') << \"\\n\";\n    }\n}",
        piramide: "#include <iostream>\n#include <string>\n\nint main() {\n    int n = 5;\n    for (int i = 1; i <= n; i++) {\n        std::cout << std::string(n - i, ' ') << std::string(2 * i - 1, '*') << \"\\n\";\n    }\n}",
        hueco: "#include <iostream>\n#include <string>\n\nint main() {\n    int n = 5;\n    for (int i = 1; i <= n; i++) {\n        if (i == 1) {\n            std::cout << std::string(n - 1, ' ') << \"*\\n\";\n        } else if (i == n) {\n            std::cout << std::string(2 * n - 1, '*') << \"\\n\";\n        } else {\n            std::cout << std::string(n - i, ' ') << \"*\" << std::string(2 * i - 3, ' ') << \"*\\n\";\n        }\n    }\n}",
        numeros: "#include <iostream>\n#include <string>\n\nint main() {\n    int n = 5;\n    for (int i = 1; i <= n; i++) {\n        for (int j = 1; j <= i; j++) {\n            if (j > 1) std::cout << \" \";\n            std::cout << j;\n        }\n        std::cout << \"\\n\";\n    }\n}",
        pascal: "#include <iostream>\n#include <string>\n#include <vector>\n\nint main() {\n    int n = 5;\n    std::vector<long long> row = {1};\n    for (int i = 0; i < n; i++) {\n        std::cout << std::string(n - i - 1, ' ');\n        for (size_t k = 0; k < row.size(); k++) {\n            if (k > 0) std::cout << \" \";\n            std::cout << row[k];\n        }\n        std::cout << \"\\n\";\n        std::vector<long long> next = {1};\n        for (size_t k = 0; k + 1 < row.size(); k++) {\n            next.push_back(row[k] + row[k + 1]);\n        }\n        next.push_back(1);\n        row = next;\n    }\n}",
        sierpinski: "#include <iostream>\n#include <string>\n\nint main() {\n    int n = 8;\n    for (int i = 0; i < n; i++) {\n        std::cout << std::string(n - i - 1, ' ');\n        for (int j = 0; j <= i; j++) {\n            if (j > 0) std::cout << \" \";\n            std::cout << ((j & i) == j ? \"*\" : \" \");\n        }\n        std::cout << \"\\n\";\n    }\n}"
      }
    }
  };

  var NOMBRES = {
    es: { rectangulo: 'Rectángulo', invertido: 'Invertido', derecha: 'A la derecha', piramide: 'Pirámide', hueco: 'Hueco', numeros: 'Con números', pascal: 'Pascal', sierpinski: 'Sierpinski' },
    en: { rectangulo: 'Right', invertido: 'Inverted', derecha: 'Right-aligned', piramide: 'Pyramid', hueco: 'Hollow', numeros: 'Numbers', pascal: 'Pascal', sierpinski: 'Sierpinski' },
    'zh-cn': { rectangulo: '直角', invertido: '倒置', derecha: '右对齐', piramide: '金字塔', hueco: '空心', numeros: '数字', pascal: '杨辉', sierpinski: '谢尔宾斯基' }
  };

  var TEXTOS = {
    es: { tipo: 'Tipo de triángulo', tamano: 'Tamaño (n)', salida: 'Lo que imprime', codigo: 'El código', copiar: 'Copiar', copiado: 'Copiado' },
    en: { tipo: 'Triangle type', tamano: 'Size (n)', salida: 'What it prints', codigo: 'The code', copiar: 'Copy', copiado: 'Copied' },
    'zh-cn': { tipo: '三角形类型', tamano: '大小 (n)', salida: '输出', codigo: '代码', copiar: '复制', copiado: '已复制' }
  };

  var NOMBRE_LENGUAJE = { python: 'Python', javascript: 'JavaScript', rust: 'Rust', cpp: 'C++' };

  function idioma() {
    var l = (document.documentElement.lang || 'es').toLowerCase();
    return l.indexOf('zh') === 0 ? 'zh-cn' : l.indexOf('en') === 0 ? 'en' : 'es';
  }

  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined) n.textContent = texto;
    return n;
  }

  function Patron(caja) {
    var lang = idioma();
    var T = TEXTOS[lang];
    var nombres = NOMBRES[lang];
    var lenguaje = caja.getAttribute('data-' + P + '-lenguaje') || 'python';
    var nombresCodigo = lang === 'es' ? CODIGO.es : CODIGO.en;
    var codigos = nombresCodigo[lenguaje] || nombresCodigo.python;
    var lista = (caja.getAttribute('data-' + P + '-tipos') || '').split(',').map(function (x) { return x.trim(); })
      .filter(function (x) { return GENERAR[x] && codigos[x]; });
    if (!lista.length) lista = Object.keys(GENERAR).filter(function (x) { return codigos[x]; });
    var tipo = lista[0];
    var n = Math.max(MIN, Math.min(MAX, parseInt(caja.getAttribute('data-' + P + '-tamano'), 10) || 5));

    var tipos = el('div', P + '-tipos');
    tipos.setAttribute('role', 'radiogroup');
    tipos.setAttribute('aria-label', T.tipo);
    var botones = lista.map(function (id) {
      var b = el('button', P + '-tipo', nombres[id] || id);
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.addEventListener('click', function () { tipo = id; dibujar(); });
      tipos.appendChild(b);
      return b;
    });

    var etiqueta = el('label', P + '-tamano');
    var valor = el('strong');
    var rango = document.createElement('input');
    rango.type = 'range';
    rango.min = MIN;
    rango.max = MAX;
    rango.value = n;
    rango.addEventListener('input', function () { n = parseInt(rango.value, 10); dibujar(); });
    etiqueta.appendChild(document.createTextNode(T.tamano + ': '));
    etiqueta.appendChild(valor);
    etiqueta.appendChild(rango);

    var salida = el('pre', P + '-salida');
    salida.setAttribute('aria-live', 'polite');
    var codigo = el('pre', P + '-codigo');
    var codigoTexto = el('code');
    codigo.appendChild(codigoTexto);
    var copiar = el('button', P + '-copiar', T.copiar);
    copiar.type = 'button';
    copiar.addEventListener('click', function () {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(codigoTexto.textContent).then(function () {
        copiar.textContent = T.copiado;
        setTimeout(function () { copiar.textContent = T.copiar; }, 1500);
      });
    });

    var cabezaCodigo = el('div', P + '-cabeza');
    cabezaCodigo.appendChild(el('span', null, T.codigo + ' (' + (NOMBRE_LENGUAJE[lenguaje] || lenguaje) + ')'));
    cabezaCodigo.appendChild(copiar);

    caja.appendChild(tipos);
    caja.appendChild(etiqueta);
    caja.appendChild(el('p', P + '-titulo', T.salida));
    caja.appendChild(salida);
    caja.appendChild(cabezaCodigo);
    caja.appendChild(codigo);

    function dibujar() {
      botones.forEach(function (b, i) {
        var activo = lista[i] === tipo;
        b.classList.toggle(P + '-activo', activo);
        b.setAttribute('aria-checked', activo ? 'true' : 'false');
      });
      valor.textContent = String(n);
      salida.textContent = GENERAR[tipo](n).join('\n');
      codigoTexto.textContent = codigos[tipo].replace(/(\bn\s*=\s*)\d+/, function (_, antes) { return antes + n; });
    }

    dibujar();
  }

  window.DjcCorePatron = { generar: function (tipo, n) { return GENERAR[tipo](n).join('\n'); }, codigo: CODIGO };

  function iniciar() {
    document.querySelectorAll('.' + P).forEach(function (caja) {
      if (caja.hasAttribute('data-' + P + '-listo')) return;
      caja.setAttribute('data-' + P + '-listo', '');
      Patron(caja);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
