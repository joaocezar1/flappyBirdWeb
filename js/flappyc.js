function novoElemento(tagName, className){
    const elem = document.createElement(tagName)
    elem.className=className;
    return elem
}

function Barreira(reversa=false){
    this.elemento=novoElemento('div','barreira')

    const borda = novoElemento('div','borda')
    const corpo = novoElemento('div','corpo')
    this.elemento.appendChild(reversa?corpo:borda)
    this.elemento.appendChild(reversa?borda:corpo)
    this.setAltura = altura=>{ corpo.style.height =`${altura}px`}
}
function ParDeBarreiras(altura,abertura,x){
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.setY = ()=>{
        const alturaSuperior = Math.random()*(altura-abertura)
        const alturaInferior = altura - abertura - alturaSuperior;
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }
    this.getX=()=>parseInt(this.elemento.style.left.split('px')[0])
    this.setX= x => this.elemento.style.left=`${x}px`
    this.getLargura=()=>this.elemento.clientWidth//propriedade do elemento dom com a largura visivel

    this.superior= new Barreira(true)
    this.inferior= new Barreira()
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.setY()
    this.setX(x)
}

function Barreiras(altura, largura, abertura, espacoBarreiras, notificarPonto){
    this.pares=[
        new ParDeBarreiras(altura, abertura,largura),
        new ParDeBarreiras(altura, abertura,largura + espacoBarreiras),
        new ParDeBarreiras(altura, abertura,largura + espacoBarreiras*2),
        new ParDeBarreiras(altura, abertura,largura + espacoBarreiras*3)
    ]
    const deslocamento =3;
    this.animar=()=>{
        this.pares.forEach(par =>{
            par.setX(par.getX()-deslocamento)
            //quando sair da tela
            if(par.getX()< -par.getLargura()){
                par.setX(par.getX()+espacoBarreiras*this.pares.length)
                par.setY()
            }
            const meio = largura/2
            const cruzouOMeio = par.getX()+deslocamento >=meio 
                && par.getX()<meio
            if(cruzouOMeio){
                notificarPonto()
            } 
        })
    }
}

function Passaro(alturaJogo){
    let voando = false
    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src='imgs/passaro.png'
    window.addEventListener('keydown', ()=>voando=true)
    window.addEventListener('keyup', ()=>voando=false)
    this.animar= ()=>{
        const novoY = this.getY()+(voando? 8:-5)
        const alturaMaxima=alturaJogo-this.elemento.clientHeight
        if(novoY<=0){
            this.setY(0)
        }else if(novoY>=alturaMaxima){
            this.setY(alturaMaxima)
        }else{
            this.setY(novoY)
        }
    }

    this.getY=()=> parseInt(this.elemento.style.bottom.split("px")[0])
    this.setY=y=>this.elemento.style.bottom=`${y}px`
    this.voar =()=>{voando=true}
    this.setY(alturaJogo/2)
}

// const barreiras = new Barreiras(700,1200,200,400)
// const passaro = new Passaro(700)
// const elemJogo = document.querySelector('[wm-flappy]')

// elemJogo.appendChild(passaro.elemento)
// elemJogo.appendChild(new Progresso().elemento)
// barreiras.pares.forEach(par=> elemJogo.appendChild(par.elemento))
// setInterval(()=>{
//     barreiras.animar()
//     passaro.animar()
// },20)
function estaoSobrepostos(elementoA, elementoB){
    const a= elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left+a.width>=b.left && b.left+b.width>=a.left
    const vertical = a.top+a.height>=b.top && b.top+b.height>=a.top

    return vertical&&horizontal
}
function colidiu(passaro, barreiras){
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras =>{
        if (!colidiu){
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu=estaoSobrepostos(passaro.elemento, superior) ||estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function Progresso(){
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos=pontos=>{
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function FlappyBird(){
    let pontos=0
    const elemJogo = document.querySelector('[wm-flappy]')
    const altura = elemJogo.clientHeight
    const largura = elemJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200,400,
        ()=>progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    elemJogo.appendChild(progresso.elemento)
    elemJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par=>elemJogo.appendChild(par.elemento))
    this.start=()=>{
        const temporizador = setInterval(()=>{
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro,barreiras)){
                clearInterval(temporizador)
            }
        },20)
    }
}
new FlappyBird().start()
