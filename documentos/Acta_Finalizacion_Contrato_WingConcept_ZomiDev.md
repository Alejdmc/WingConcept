# ACTA DE FINALIZACIÓN Y CIERRE DEL CONTRATO DE PRESTACIÓN DE SERVICIOS DE DESARROLLO DE SOFTWARE

**Bogotá D.C., Colombia — 31 de agosto de 2026**

---

## CLÁUSULA PRIMERA. PARTES

El presente documento se suscribe entre las siguientes partes:

**EL CLIENTE:** WingConcept, representado por Andrés (correo: andres@wingconcept.com), en adelante **EL CLIENTE**.

**EL DESARROLLADOR:** Equipo de trabajo ZomiDev, representado por Daniel Alejandro Monroy C., C.C. 1.034.398.030, correo: aledmc@zomidev.com, teléfono: 323 812 5686, en adelante **EL DESARROLLADOR** o **ZomiDev**.

Ambas partes declaran haber celebrado el **Contrato de Prestación de Servicios de Desarrollo de Software** suscrito en Bogotá el **15 de mayo de 2026** (en adelante, **el Contrato**), bajo la **modalidad base** por valor de **CUATRO MILLONES DE PESOS COLOMBIANOS (COP 4.000.000)**, sin modelado 3D.

---

## CLÁUSULA SEGUNDA. OBJETO DEL PRESENTE DOCUMENTO

El objeto de esta acta es dejar constancia del estado actual del proyecto, de los factores que han incidido en el cronograma, de las obligaciones pendientes de cada parte y del **compromiso de ZomiDev para finalizar el contrato** dentro del alcance pactado, con miras a la entrega definitiva, el pago final y el cierre formal de la relación contractual.

Este documento complementa y no sustituye el Contrato original, salvo en lo expresamente modificado o aclarado aquí.

---

## CLÁUSULA TERCERA. CRONOGRAMA CONTRACTUAL Y ESTADO DEL PROYECTO

### 3.1. Cronograma de referencia (Contrato — Cláusula Octava)

| Fase | Semanas estimadas | Alcance contractual |
|------|-------------------|---------------------|
| Fase 1 | 1–2 | Infraestructura, Docker, Supabase, CI/CD |
| Fase 2 | 3–4 | Autenticación, roles y sesiones |
| Fase 3 | 4–6 | Catálogo, panel admin, gestión de assets |
| Fase 4 | 7–10 | Configurador interactivo (modalidad base: imágenes planas) |
| Fase 5 | 10–12 | Carrito, checkout e integración de pagos |
| Fase 6 | 12–13 | Pruebas, optimización y despliegue en producción |

Duración estimada total: **trece (13) semanas** a partir del inicio del proyecto.

### 3.2. Fechas relevantes de ejecución

| Fecha | Hito |
|-------|------|
| 15 de mayo de 2026 | Firma del Contrato |
| 20 de mayo de 2026 | Inicio efectivo del desarrollo (repositorio y estructura del proyecto) |
| 30 de mayo de 2026 | Autenticación, registro, login y carrito base implementados |
| 3 de junio de 2026 | Home, footer, conexión frontend–backend y carrito operativo |
| 11 de junio de 2026 | Configurador Vanguard y personalización de productos |
| 4–5 de agosto de 2026 | Despliegue en producción (VPS, Nginx, SSL) y correcciones de estabilidad |
| 11–13 de agosto de 2026 | Ajustes de carrito, imágenes del configurador y alineación de contenido |
| 15 de agosto de 2026 | Integración de pagos con Stripe (USD) |
| 20 de agosto de 2026 | Catálogo Disruptor (paramotores y paratrike) |
| 26 de agosto de 2026 | CMS ampliado, galerías del configurador, catálogo de repuestos y dealers |
| 31 de agosto de 2026 | Fecha de suscripción del presente documento |

### 3.3. Avance técnico entregado por ZomiDev

A la fecha de este documento, **EL DESARROLLADOR** ha construido y desplegado, conforme al Contrato, los siguientes módulos:

a) **Sistema de autenticación** con registro, inicio de sesión, recuperación de contraseña, verificación de correo y roles (cliente / administrador).

b) **Catálogo de productos** con variantes, filtros, páginas de detalle, paramotores (Vanguard, Disruptor), paratrikes (Nomadic, Vanguard, Disruptor), repuestos y accesorios.

c) **Carrito de compras persistente** para usuarios registrados y visitantes anónimos.

d) **Configurador interactivo** en modalidad base (imágenes planas provistas por EL CLIENTE), con selección de componentes y cálculo de precios.

e) **Proceso de checkout** en pasos (carrito → envío → pago), con cupones, impuestos y validación de sesión.

f) **Integración de pagos** con Wompi (COP) y Stripe (USD).

g) **Panel de administración** para productos, órdenes, usuarios, contenidos (CMS), dealers, manuales y estadísticas.

h) **Base de datos** en Supabase (PostgreSQL) con migraciones Alembic.

i) **Infraestructura de producción** con Docker, Nginx, certificado SSL (Let's Encrypt) y despliegue en VPS.

j) **Servicios complementarios**: correos transaccionales (Resend), protección con Cloudflare Turnstile, timeline de órdenes y notificaciones por email.

El proyecto se encuentra **operativo en producción** en el dominio acordado. Quedan pendientes los ajustes finales descritos en la Cláusula Séptima de este documento.

---

## CLÁUSULA CUARTA. FACTORES QUE HAN AFECTADO EL CRONOGRAMA

Las partes dejan constancia de que el cronograma contractual de trece (13) semanas es **referencial** (Contrato, Cláusula Octava) y que su cumplimiento ha sido impactado por causas atribuibles a **EL CLIENTE**, conforme a la Cláusula Séptima del Contrato, en los siguientes aspectos:

### 4.1. Retrasos en el suministro de información y materiales

De acuerdo con la Cláusula Séptima literal b) y c) del Contrato, **EL CLIENTE** debía proveer fotografías en alta resolución y textos descriptivos **antes del inicio de la Fase 3**. Sin embargo, durante la ejecución del proyecto se registraron demoras reiteradas en:

- El envío de **imágenes de productos** y del configurador.
- El envío de **textos, descripciones y documentación** de productos y páginas del sitio.
- La entrega de **materiales de referencia** (incluidos documentos en formato Pages/PDF) con información incompleta, desactualizada o con errores que obligaron a solicitudes adicionales de aclaración.

Estas demoras no son responsabilidad de **EL DESARROLLADOR** y constituyen causa de extensión del cronograma según lo pactado en la Cláusula Séptima literal e).

### 4.2. Retrasos en pagos

Conforme a la Cláusula Quinta del Contrato:

- **Pago inicial (COP 1.500.000):** recibido al inicio del proyecto.
- **Segundo pago (COP 1.000.000):** exigible al entregar el backend funcional con catálogo, autenticación y panel de administración básico (fin de Fase 3).
- **Pago final (COP 1.500.000):** exigible al despliegue final en producción con todas las funcionalidades contratadas operando correctamente.

Las partes dejan constancia de que **EL CLIENTE** incurrió en **retrasos en el cumplimiento de los pagos** acordados para los hitos intermedios, lo cual obligó a **EL DESARROLLADOR** a suspender o ralentizar fases del trabajo conforme a la Cláusula Quinta (“EL DESARROLLADOR no iniciará cada fase sin haber recibido el pago correspondiente a la misma”) y a la Cláusula Décima Cuarta literal b) (suspensión por incumplimiento en pagos).

### 4.3. Retrasos en respuestas y aprobaciones

La Cláusula Séptima literal e) establece que **EL CLIENTE** debe responder solicitudes de revisión o aprobación en un plazo máximo de **cinco (5) días hábiles**. Se registraron múltiples ocasiones en las que las respuestas, validaciones y aprobaciones del cliente excedieron dicho plazo, afectando directamente la capacidad de **EL DESARROLLADOR** para avanzar en configuración de contenido, carga de imágenes y ajustes solicitados.

### 4.4. Comunicaciones fuera de horario laboral

**EL DESARROLLADOR** mantiene como horario de atención profesional el **lunes a viernes, de 8:00 a.m. a 6:00 p.m.** (hora Colombia, UTC-5). Durante la ejecución del Contrato, **EL CLIENTE** envió mensajes y solicitudes **fuera del horario laboral** (noches, fines de semana y festivos), incluyendo exigencias de respuesta inmediata que no se ajustan a las prácticas profesionales de desarrollo de software ni a los tiempos de respuesta pactados en el Contrato.

Las partes acuerdan que, para la etapa de cierre y cualquier relación posterior, las comunicaciones se realizarán preferentemente en horario laboral y con los plazos de respuesta establecidos contractualmente.

### 4.5. Demora no atribuible al desarrollo del código

**EL DESARROLLADOR** deja constancia de que los tiempos de desarrollo, prueba y despliegue del código fuente han sido ejecutados de forma continua y documentada (historial de versiones del repositorio). Las extensiones del cronograma **no se deben a demoras en la creación o producción del código**, sino principalmente a:

1. Espera de materiales e información del cliente.
2. Retrasos en pagos de hitos.
3. Ciclos de revisión y corrección de contenido provisto por el cliente.
4. Solicitudes de ajustes sobre materiales entregados tardíamente o de forma incompleta.

---

## CLÁUSULA QUINTA. ACLARACIÓN SOBRE CONTENIDOS, IMÁGENES Y DOCUMENTOS DEL CLIENTE

### 5.1. Imágenes

Conforme a la Cláusula Cuarta del Contrato (modalidad base), el configurador y el catálogo funcionan con **ilustraciones o imágenes planas provistas por EL CLIENTE**. La Cláusula Séptima literal b) obliga al cliente a proveer fotografías en alta resolución.

**Queda expresamente aclarado que NO forma parte del alcance contractual:**

- Crear, diseñar, editar o producir imágenes de productos.
- Buscar imágenes en internet, enlaces o fuentes externas.
- Extraer, descargar o reutilizar imágenes desde URLs o sitios de terceros.
- Investigar, redactar o corregir información comercial o técnica de productos.

La obligación de **EL DESARROLLADOR** se limita a **cargar e integrar en la plataforma las imágenes que EL CLIENTE entregue directamente** en formato adecuado (JPEG, PNG, WebP u otro acordado), con resolución suficiente para su uso en web.

### 5.2. Textos y documentos

Los textos descriptivos, nombres de productos, especificaciones técnicas y demás contenidos editoriales son responsabilidad de **EL CLIENTE** (Cláusula Séptima literal c)). Los documentos entregados por **EL CLIENTE** durante el proyecto —incluidos archivos Pages, PDF y comunicaciones escritas— contenían en varias ocasiones **errores ortográficos, gramaticales y de redacción**.

**EL DESARROLLADOR** no está obligado contractualmente a corregir la ortografía ni la calidad editorial de los materiales provistos por el cliente. La integración de dichos textos en la plataforma se realiza conforme a lo entregado, salvo errores evidentes de transcripción durante la carga que puedan corregirse de forma menor sin alterar el sentido del contenido.

### 5.3. Solicitudes fuera de alcance

Cualquier funcionalidad, contenido o servicio no descrito en la Cláusula Segunda del Contrato se considera **fuera de alcance** (Cláusula Décima Segunda) y deberá cotizarse y formalizarse mediante otrosí antes de su ejecución.

---

## CLÁUSULA SEXTA. ESTADO DE PAGOS

| Concepto | Valor (COP) | Estado |
|----------|-------------|--------|
| Pago inicial (37,5 %) | 1.500.000 | Recibido |
| Segundo pago — MVP Fase 3 (25 %) | 1.000.000 | [ ] Recibido / [ ] Pendiente |
| Pago final — despliegue producción (37,5 %) | 1.500.000 | Pendiente de entrega final |
| **Total modalidad base** | **4.000.000** | |

*Nota: Las partes deberán marcar el estado real del segundo pago al momento de la firma.*

El **pago final (COP 1.500.000)** se efectuará al completar los compromisos de la Cláusula Séptima y verificar el correcto funcionamiento de todas las funcionalidades contratadas en producción, conforme a la Cláusula Quinta del Contrato.

---

## CLÁUSULA SÉPTIMA. COMPROMISOS DE ZOMIDEV PARA LA FINALIZACIÓN DEL CONTRATO

**EL DESARROLLADOR** se compromete a completar, dentro del alcance contractual y sin costo adicional, los siguientes ajustes finales:

### 7.1. Ajustes al flujo paso a paso del carrito y checkout

Implementar y/o corregir los ajustes solicitados por **EL CLIENTE** respecto al **proceso paso a paso del carrito de compras y checkout**, incluyendo:

- Navegación clara entre los pasos del flujo (carrito → envío → pago).
- Comportamiento consistente de cantidades, totales, cupones e impuestos en cada paso.
- Validaciones de sesión y correo verificado antes del pago.
- Experiencia de usuario coherente en dispositivos móviles y escritorio.

### 7.2. Carga de imágenes provistas por el cliente

Subir e integrar en la plataforma las **imágenes entregadas directamente por EL CLIENTE** para:

- Catálogo de productos y variantes.
- Galerías del configurador interactivo.
- Secciones del sitio que requieran assets visuales según el Contrato.

**Condición:** Las imágenes deberán ser entregadas por **EL CLIENTE** en archivos propios (no enlaces URL), en formato y resolución aptos para publicación web. **EL DESARROLLADOR** no creará, buscará ni obtendrá imágenes de fuentes externas.

### 7.3. Plazo de ejecución de los compromisos finales

**EL DESARROLLADOR** ejecutará los ajustes de los numerales 7.1 y 7.2 en un plazo de **diez (10) días hábiles** contados a partir de:

1. La recepción de **todas las imágenes pendientes** en archivos (no links), y
2. La confirmación escrita de **EL CLIENTE** sobre los ajustes específicos del flujo del carrito que aún requieran corrección, y
3. La recepción del **pago pendiente del segundo hito**, de existir saldo por dicho concepto.

Si **EL CLIENTE** no entrega los materiales o no confirma los ajustes dentro de los cinco (5) días hábiles siguientes a la firma de este documento, el plazo de ejecución se prorrogará en igual proporción a la demora del cliente.

---

## CLÁUSULA OCTAVA. OBLIGACIONES PENDIENTES DE EL CLIENTE

Para la correcta finalización del Contrato, **EL CLIENTE** se compromete a:

a) Entregar **todas las imágenes pendientes** en archivos de alta resolución, sin depender de enlaces externos.

b) Entregar o confirmar los **textos definitivos** de productos y páginas, con la ortografía y contenido que desee publicar.

c) Realizar el **pago pendiente** conforme a la Cláusula Sexta de este documento y la Cláusula Quinta del Contrato.

d) Probar y aprobar los ajustes finales en un plazo máximo de **cinco (5) días hábiles** desde su notificación.

e) Mantener activa y al día la cuenta de **Supabase** (plan Pro, USD 20/mes) y demás servicios de operación (VPS, dominio, Wompi, Stripe), conforme a la Cláusula Tercera y Séptima del Contrato.

f) Comunicarse en **horario laboral** (lunes a viernes, 8:00 a.m. – 6:00 p.m., hora Colombia) para solicitudes de revisión y cierre.

---

## CLÁUSULA NOVENA. ENTREGA DEL CÓDIGO Y PROPIEDAD INTELECTUAL

Conforme a la Cláusula Novena del Contrato:

- El **código fuente completo** será entregado a **EL CLIENTE** una vez se haya efectuado el **pago total** del Contrato (COP 4.000.000).
- Hasta ese momento, el código permanece bajo custodia de **EL DESARROLLADOR**.
- Las imágenes, textos, logos y contenidos del sitio son propiedad de **EL CLIENTE**.
- **EL DESARROLLADOR** conserva el derecho de mencionar el proyecto en su portafolio profesional, sin revelar información confidencial.

---

## CLÁUSULA DÉCIMA. GARANTÍA POST-ENTREGA

Una vez completada la entrega final y recibido el pago total, operará el **periodo de garantía de noventa (90) días calendario** establecido en la Cláusula Sexta literal f) del Contrato, durante el cual **EL DESARROLLADOR** corregirá sin costo adicional los **errores funcionales directamente atribuibles al desarrollo**.

Quedan excluidos de la garantía:

- Errores derivados de contenidos, imágenes o textos provistos por el cliente.
- Cambios de alcance o nuevas funcionalidades.
- Fallas en servicios de terceros (Supabase, Wompi, Stripe, VPS, dominio).
- Modificaciones realizadas por el cliente o terceros sobre el código entregado.

---

## CLÁUSULA DÉCIMA PRIMERA. CIERRE DEL CONTRATO

Una vez cumplidas las obligaciones de ambas partes —incluidos los compromisos de la Cláusula Séptima, el pago total y la aprobación de la entrega final—, el Contrato se dará por **terminado satisfactoriamente** y las partes no tendrán obligaciones pendientes derivadas del mismo, salvo las de confidencialidad (Cláusula Décima del Contrato) y la garantía de noventa (90) días.

Cualquier trabajo adicional posterior al cierre deberá formalizarse en un **contrato de mantenimiento** o **nuevo acuerdo** independiente (Cláusula Décima Tercera del Contrato).

---

## CLÁUSULA DÉCIMA SEGUNDA. DISPOSICIONES GENERALES

- El presente documento se rige por las leyes de la República de Colombia.
- Cualquier controversia se resolverá de buena fe entre las partes y, de no lograrse acuerdo, por los mecanismos previstos en la ley colombiana.
- Este documento constituye acuerdo complementario al Contrato del 15 de mayo de 2026 y deberá ser firmado por ambas partes para surtir efecto.
- Se firma en dos (2) ejemplares de igual valor, uno para cada parte.

---

## FIRMAS

&nbsp;

| | |
|---|---|
| _________________________________ | _________________________________ |
| **EL CLIENTE — WingConcept** | **EL DESARROLLADOR — ZomiDev** |
| Nombre: _________________________ | Nombre: Daniel Alejandro Monroy C. |
| C.C.: ___________________________ | C.C.: 1.034.398.030 |
| Correo: andres@wingconcept.com | Correo: aledmc@zomidev.com |
| Teléfono: _______________________ | Teléfono: 323 812 5686 |
| Ciudad y fecha: __________________ | Ciudad y fecha: Bogotá, 31 de agosto de 2026 |

---

*Documento generado por ZomiDev como acta de finalización del Contrato de Prestación de Servicios de Desarrollo de Software — Proyecto WingConcept E-commerce.*
