/**
 * Gracias a https://github.com/chaangliu/ForceDirectedLayout/blob/master/javascript/force-directed.js
 * Una implementación de diseño de gráfico dirigido por fuerza de liuchang el 2018/05/10.
 */
const CANVAS_WIDTH = 1000
const CANVAS_HEIGHT = 1000
let k
let mNodeList = []
let mEdgeList = []
let mDxMap = {}
let mDyMap = {}
let mNodeMap = {}

export function ForceDirected (data = {}) {
  // Generar nodos y bordes
  // for (let i = 0; i < 20; i++) {
  //     mNodeList.push(new Node(i))
  // }
  k = 0
  mNodeList = []
  mEdgeList = []
  mDxMap = {}
  mDyMap = {}
  mNodeMap = {}

  const nodeList = data.nodeList
  for (let i = 0; i < nodeList.length; i++) {
    const node = nodeList[i]
    mNodeList.push(node)
  }

  // for (let i = 0; i < 20; i++) {
  //     let edgeCount = Math.random() * 8 + 1
  //     for (let j = 0; j < edgeCount; j++) {
  //         let targetId = Math.floor(Math.random() * 20)
  //         let edge = new Edge(i, targetId)
  //         mEdgeList.push(edge)
  //     }
  // }
  // Convertir línea a borde
  const lineList = data.lineList
  for (let i = 0; i < lineList.length; i++) {
    const line = lineList[i]
    const edge = new Edge(line.from, line.to)
    mEdgeList.push(edge)
  }

  if (mNodeList && mEdgeList) {
    k = Math.sqrt(CANVAS_WIDTH * CANVAS_HEIGHT / mNodeList.length)
  }
  for (let i = 0; i < mNodeList.length; i++) {
    const node = mNodeList[i]
    if (node) {
      mNodeMap[node.id] = node
    }
  }

  // Generar coordenadas aleatoriamente.
  // eslint-disable-next-line prefer-const
  let initialX, initialY, initialSize = 40.0
  for (const i in mNodeList) {
    initialX = CANVAS_WIDTH * 0.5
    initialY = CANVAS_HEIGHT * 0.5
    mNodeList[i].x = initialX + initialSize * (Math.random() - 0.5)
    mNodeList[i].y = initialY + initialSize * (Math.random() - 0.5)
  }

  // Iterar 200 veces.
  for (let i = 0; i < 200; i++) {
    calculateRepulsive()
    calculateAttraction()
    updateCoordinates()
  }
  // Agregar coordenadas en px
  for (let i = 0; i < mNodeList.length; i++) {
    const node = mNodeList[i]
    node.left = node.x + 'px'
    node.top = node.y + 'px'
    node.x = undefined
    node.y = undefined
  }

  data.nodeList = mNodeList

  return data
}

// eslint-disable-next-line no-unused-vars
function Node (id = null) {
  this.id = id
  this.x = 22
  this.y = null
}

function Edge (source = null, target = null) {
  this.source = source
  this.target = target
}

/**
 * Calcular el desplazamiento generado por la fuerza repulsiva entre dos nodos.
 */
function calculateRepulsive () {
  let repulsiveFactor = 6
  let distX, distY, dist
  for (let i = 0; i < mNodeList.length; i++) {
    mDxMap[mNodeList[i].id] = 0.0
    mDyMap[mNodeList[i].id] = 0.0
    for (let j = 0; j < mNodeList.length; j++) {
      if (i !== j) {
        distX = mNodeList[i].x - mNodeList[j].x
        distY = mNodeList[i].y - mNodeList[j].y
        dist = Math.sqrt(distX * distX + distY * distY)
      }
      if (dist < 30) {
        repulsiveFactor = 5
      }
      if (dist > 0 && dist < 250) {
        const id = mNodeList[i].id
        mDxMap[id] = mDxMap[id] + distX / dist * k * k / dist * repulsiveFactor
        mDyMap[id] = mDyMap[id] + distY / dist * k * k / dist * repulsiveFactor
      }
    }
  }
}

/**
 * Calcular la fuerza de atracción generada por el borde actuando sobre los dos nodos de sus extremos.
 */
function calculateAttraction () {
  const attractiveFactor = 3
  let startNode, endNode
  for (let e = 0; e < mEdgeList.length; e++) {
    const eStartID = mEdgeList[e].source
    const eEndID = mEdgeList[e].target
    startNode = mNodeMap[eStartID]
    endNode = mNodeMap[eEndID]
    if (!startNode) {
      console.log('No se puede encontrar el nodo inicial con id: ' + eStartID + ', por favor revísalo.')
      return
    }
    if (!endNode) {
      console.log('No se puede encontrar el nodo final con id: ' + eEndID + ', por favor revísalo.')
      return
    }
    const distX = startNode.x - endNode.x
    const distY = startNode.y - endNode.y
    const dist = Math.sqrt(distX * distX + distY * distY)
    mDxMap[eStartID] = mDxMap[eStartID] - distX * dist / k * attractiveFactor
    mDyMap[eStartID] = mDyMap[eStartID] - distY * dist / k * attractiveFactor
    mDxMap[eEndID] = mDxMap[eEndID] + distX * dist / k * attractiveFactor
    mDyMap[eEndID] = mDyMap[eEndID] + distY * dist / k * attractiveFactor
  }
}

/**
 * Actualizar las coordenadas.
 */
function updateCoordinates () {
  const maxTx = 4, maxTy = 3 // Coeficientes adicionales.
  for (let v = 0; v < mNodeList.length; v++) {
    const node = mNodeList[v]
    let dx = Math.floor(mDxMap[node.id])
    let dy = Math.floor(mDyMap[node.id])

    if (dx < -maxTx) dx = -maxTx
    if (dx > maxTx) dx = maxTx
    if (dy < -maxTy) dy = -maxTy
    if (dy > maxTy) dy = maxTy
    node.x = node.x + dx >= CANVAS_WIDTH || node.x + dx <= 0 ? node.x - dx : node.x + dx
    node.y = node.y + dy >= CANVAS_HEIGHT || node.y + dy <= 0 ? node.y - dy : node.y + dy
  }
}

// eslint-disable-next-line no-unused-vars
function Result (nodes = null, links = null) {
  this.nodes = nodes
  this.links = links
}
