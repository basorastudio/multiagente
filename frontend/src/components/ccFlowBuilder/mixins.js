export const easyFlowMixin = {
  data () {
    return {
      jsplumbSetting: {
        // Anclajes dinámicos, posición adaptativa
        Anchors: ['Top', 'TopCenter', 'TopRight', 'TopLeft', 'Right', 'RightMiddle', 'Bottom', 'BottomCenter', 'BottomRight', 'BottomLeft', 'Left', 'LeftMiddle'],
        // ID del contenedor
        Container: 'efContainer',
        // Estilo de la línea de conexión, línea recta o curva, etc., valores opcionales: StateMachine, Flowchart, Bezier, Straight
        Connector: ['Bezier', { curviness: 100 }],
        // Connector: ['Straight', {stub: 20, gap: 1}],
        // Connector: ['Flowchart', {stub: 30, gap: 1, alwaysRespectStubs: false, midpoint: 0.5, cornerRadius: 10}],
        // Connector: ['StateMachine', {margin: 5, curviness: 10, proximityLimit: 80}],
        // El ratón no puede arrastrar para eliminar la línea
        ConnectionsDetachable: false,
        // Al eliminar la línea, el nodo no se elimina
        DeleteEndpointsOnDetach: false,
        /**
         * Tipo de punto final en ambos extremos de la línea de conexión: circular
         * radius: radio del círculo, cuanto mayor sea el radio, mayor será el círculo
         */
        // Endpoint: ['Dot', {radius: 5, cssClass: 'ef-dot', hoverClass: 'ef-dot-hover'}],
        /**
         * Tipo de punto final en ambos extremos de la línea de conexión: rectangular
         * height: altura del rectángulo
         * width: ancho del rectángulo
         */
        // Endpoint: ['Rectangle', {height: 20, width: 20, cssClass: 'ef-rectangle', hoverClass: 'ef-rectangle-hover'}],
        /**
         * Punto final de imagen
         */
        // Endpoint: ['Image', {src: 'https://www.easyicon.net/api/resizeApi.php?id=1181776&size=32', cssClass: 'ef-img', hoverClass: 'ef-img-hover'}],
        /**
         * Punto final en blanco
         */
        Endpoint: ['Blank', { Overlays: '' }],
        // Endpoints: [['Dot', {radius: 5, cssClass: 'ef-dot', hoverClass: 'ef-dot-hover'}], ['Rectangle', {height: 20, width: 20, cssClass: 'ef-rectangle', hoverClass: 'ef-rectangle-hover'}]],
        /**
         * Estilo de los puntos finales en ambos extremos de la línea de conexión
         * fill: valor del color, por ejemplo: #12aabb, si está vacío no se muestra
         * outlineWidth: ancho de la línea exterior
         */
        EndpointStyle: { fill: '#1879ffa1', outlineWidth: 1 },
        // Si se habilita o no el registro interno de jsPlumb
        LogEnabled: true,
        /**
         * Estilo de la línea de conexión
         */
        PaintStyle: {
          // Color de la línea
          stroke: '#E0E3E7',
          // Grosor de la línea, cuanto mayor sea el valor, más gruesa será la línea
          strokeWidth: 1,
          // Establecer el color de la línea exterior, por defecto transparente, así otras personas no lo verán, al hacer clic en la línea no se necesita precisión, referencia https://blog.csdn.net/roymno2/article/details/72717101
          outlineStroke: 'transparent',
          // Ancho de la línea exterior, cuanto mayor sea el valor, mayor será el rango de clic de la línea
          outlineWidth: 10
        },
        DragOptions: { cursor: 'pointer', zIndex: 2000 },
        /**
         * Superposición, referencia: https://www.jianshu.com/p/d9e9918fd928
         */
        Overlays: [
          // Superposición de flecha
          ['Arrow', {
            width: 10, // Ancho de la cola de la flecha
            length: 8, // Distancia desde la cola hasta la cabeza de la flecha
            location: 1, // Posición, se recomienda usar valores entre 0 y 1
            direction: 1, // Dirección, valor predeterminado 1 (hacia adelante), opcional -1 (hacia atrás)
            foldback: 0.623 // Retroceso, es decir, el ángulo de la cola, predeterminado 0.623, cuando es 1, es un triángulo equilátero
          }],
          // ['Diamond', {
          //     events: {
          //         dblclick: function (diamondOverlay, originalEvent) {
          //             console.log('double click on diamond overlay for : ' + diamondOverlay.component)
          //         }
          //     }
          // }],
          ['Label', {
            label: '',
            location: 0.1,
            cssClass: 'aLabel'
          }]
        ],
        // Modo de renderizado del gráfico svg, canvas
        RenderMode: 'svg',
        // Estilo del cursor al pasar por encima de la línea
        HoverPaintStyle: { stroke: '#b0b2b5', strokeWidth: 1 },
        // Efecto al pasar por encima del ancla
        // EndpointHoverStyle: {fill: 'red'}
        Scope: 'jsPlumb_DefaultScope' // Alcance, solo los puntos con el mismo scope pueden conectarse
      },
      /**
       * Parámetros de la línea de conexión
       */
      jsplumbConnectOptions: {
        isSource: true,
        isTarget: true,
        // Anclaje dinámico, proporciona 4 direcciones Continuous, AutoDefault
        anchor: 'Continuous',
        // Establecer el estilo de la etiqueta en la línea de conexión
        labelStyle: {
          cssClass: 'flowLabel'
        },
        // Se modificó el código fuente de jsplumb, soporte para etiquetas vacías que pasan en estilo personalizado
        emptyLabelStyle: {
          cssClass: 'emptyFlowLabel'
        }
      },
      /**
       * Configuración de parámetros del punto de origen
       */
      jsplumbSourceOptions: {
        // Establecer el nombre de la clase que se puede arrastrar, siempre que el ratón se mueva sobre el DOM con este nombre de clase, se puede arrastrar la línea de conexión
        filter: '.flow-node-drag',
        filterExclude: false,
        anchor: 'Continuous',
        // Si se permite o no conectarse a sí mismo
        allowLoopback: true,
        maxConnections: -1,
        onMaxConnections: function (info, e) {
          console.log(`Se ha superado el valor máximo de conexiones: ${info.maxConnections}`)
        }
      },
      // Referencia https://www.cnblogs.com/mq0036/p/7942139.html
      jsplumbSourceOptions2: {
        // Establecer el nombre de la clase que se puede arrastrar, siempre que el ratón se mueva sobre el DOM con este nombre de clase, se puede arrastrar la línea de conexión
        filter: '.flow-node-drag',
        filterExclude: false,
        // anchor: 'Continuous',
        // Si se permite o no conectarse a sí mismo
        allowLoopback: true,
        connector: ['Flowchart', { curviness: 50 }],
        connectorStyle: {
          // Color de la línea
          stroke: 'red',
          // Grosor de la línea, cuanto mayor sea el valor, más gruesa será la línea
          strokeWidth: 1,
          // Establecer el color de la línea exterior, por defecto transparente, así otras personas no lo verán, al hacer clic en la línea no se necesita precisión, referencia https://blog.csdn.net/roymno2/article/details/72717101
          outlineStroke: 'transparent',
          // Ancho de la línea exterior, cuanto mayor sea el valor, mayor será el rango de clic de la línea
          outlineWidth: 10
        },
        connectorHoverStyle: { stroke: 'red', strokeWidth: 2 }
      },
      jsplumbTargetOptions: {
        // Establecer el nombre de la clase que se puede arrastrar, siempre que el ratón se mueva sobre el DOM con este nombre de clase, se puede arrastrar la línea de conexión
        filter: '.flow-node-drag',
        filterExclude: false,
        // Si se permite o no conectarse a sí mismo
        anchor: 'Continuous',
        allowLoopback: true,
        dropOptions: { hoverClass: 'ef-drop-hover' }
      }
    }
  }
}
