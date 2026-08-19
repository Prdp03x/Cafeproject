// import { withGST } from "../../utils/gst";

// const MenuCard = ({ item, onClick }) => {
//   return (
//     <div
//       onClick={onClick}
//       className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
//     >
//       {/* Image */}
//       <div className="relative">
//         <img
//           src={item.image}
//           alt={item.name}
//           className="h-44 w-full object-cover"
//         />

//         {/* Floating Add Button */}
//         <button
//           className="theme-primary theme-primary-hover absolute bottom-3 right-3 rounded-full px-4 py-1.5 text-sm text-white shadow"
//           onClick={(e) => {
//             e.stopPropagation(); // prevent modal open
//             onClick(); // open modal instead
//           }}
//         >
//           Add
//         </button>
//       </div>

//       {/* Content */}
//       <div className="p-4">
//         <h3 className="theme-text line-clamp-1 text-lg font-semibold">
//           {item.name}
//         </h3>

//         <p className="text-[#5db072] text-xs mt-1 line-clamp-2">
//           {item.description || "Tasty and fresh"}
//         </p>

//         <div className="mt-3 flex justify-between items-center">
//           <span className="font-bold text-gray-800">
//             ₹ {Math.round(withGST(item.price))}
//           </span>
//           <span className="block text-[10px] text-gray-400">
//             {item.options?.length > 0 ? "onwards · incl. GST" : "incl. GST"}
//           </span>

//           {item.options?.length > 0 && (
//             <span className="text-xs text-gray-400">Customizable</span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MenuCard;


import { useEffect, useRef } from "react";
import { withGST } from "../../utils/gst";

/*
========================================================
GLOBAL ANIMATION CONTROLLER

Only actively interacting cards are animated.
This is important if you have 100–500 menu cards.
========================================================
*/

const activeCards = new Set();
let animationFrame = null;

function animateCards() {
  activeCards.forEach((controller) => {
    controller.update();
  });

  if (activeCards.size > 0) {
    animationFrame = requestAnimationFrame(animateCards);
  } else {
    animationFrame = null;
  }
}

function startAnimation(controller) {
  activeCards.add(controller);

  if (!animationFrame) {
    animationFrame = requestAnimationFrame(animateCards);
  }
}

function stopAnimation(controller) {
  activeCards.delete(controller);
}


/*
========================================================
MENU CARD
========================================================
*/

const MenuCard = ({
  item,
  onClick,

  /*
  3D settings
  */

  depth = 18,
  rotation = 7,
  parallax = 10,
}) => {

  const cardRef = useRef(null);
  const imageRef = useRef(null);

  const rect = useRef(null);

  const target = useRef({
    x: 0,
    y: 0,
  });

  const current = useRef({
    x: 0,
    y: 0,
  });

  const active = useRef(false);


  /*
  ======================================================
  UPDATE RECT
  ======================================================
  */

  const updateRect = () => {
    if (!cardRef.current) return;

    rect.current =
      cardRef.current.getBoundingClientRect();
  };


  /*
  ======================================================
  NORMALIZE POINTER POSITION
  ======================================================

  Returns:

  LEFT   = -1
  CENTER =  0
  RIGHT  = +1

  TOP    = -1
  CENTER =  0
  BOTTOM = +1
  */

  const normalizePointer = (
    clientX,
    clientY
  ) => {

    if (!rect.current) {
      updateRect();
    }

    const r = rect.current;

    if (!r) {
      return {
        x: 0,
        y: 0,
      };
    }

    const px =
      (clientX - r.left) /
      r.width;

    const py =
      (clientY - r.top) /
      r.height;

    return {
      x: Math.max(
        -1,
        Math.min(
          1,
          px * 2 - 1
        )
      ),

      y: Math.max(
        -1,
        Math.min(
          1,
          py * 2 - 1
        )
      ),
    };
  };


  /*
  ======================================================
  POINTER MOVE
  ======================================================
  */

  const handlePointerMove = (event) => {

    active.current = true;

    const point =
      normalizePointer(
        event.clientX,
        event.clientY
      );

    target.current.x =
      point.x;

    target.current.y =
      point.y;

    startAnimation(controller);
  };


  /*
  ======================================================
  POINTER DOWN
  ======================================================
  */

  const handlePointerDown = (event) => {

    active.current = true;

    cardRef.current?.setPointerCapture?.(
      event.pointerId
    );

    const point =
      normalizePointer(
        event.clientX,
        event.clientY
      );

    target.current.x =
      point.x;

    target.current.y =
      point.y;

    startAnimation(controller);
  };


  /*
  ======================================================
  RELEASE
  ======================================================
  */

  const releasePointer = () => {

    active.current = false;

    target.current.x = 0;
    target.current.y = 0;

    /*
    Don't immediately stop.

    Let the card smoothly return to normal.
    */
    startAnimation(controller);
  };


  /*
  ======================================================
  MOUSE LEAVE
  ======================================================
  */

  const handlePointerLeave = (event) => {

    if (
      event.pointerType === "mouse"
    ) {
      releasePointer();
    }
  };


  /*
  ======================================================
  ANIMATION CONTROLLER
  ======================================================
  */

  const controller = {

    update() {

      const card =
        cardRef.current;

      const image =
        imageRef.current;

      if (!card || !image) {
        stopAnimation(controller);
        return;
      }


      /*
      --------------------------------------------------
      SMOOTH MOVEMENT
      --------------------------------------------------
      */

      const ease =
        active.current
          ? 0.16
          : 0.09;


      current.current.x +=
        (
          target.current.x -
          current.current.x
        ) * ease;


      current.current.y +=
        (
          target.current.y -
          current.current.y
        ) * ease;


      const x =
        current.current.x;

      const y =
        current.current.y;


      /*
      --------------------------------------------------
      DISTANCE FROM CENTER
      --------------------------------------------------
      */

      const distance =
        Math.sqrt(
          x * x +
          y * y
        );


      const pressure =
        Math.min(
          distance,
          1
        );


      /*
      --------------------------------------------------
      SMOOTH PRESSURE
      --------------------------------------------------
      */

      const smoothPressure =
        pressure *
        pressure *
        (3 - 2 * pressure);


      /*
      --------------------------------------------------
      IMAGE ROTATION
      --------------------------------------------------
      */

      const rotateX =
        -y *
        rotation *
        smoothPressure;


      const rotateY =
        x *
        rotation *
        smoothPressure;


      /*
      --------------------------------------------------
      IMAGE Z DEPTH
      --------------------------------------------------
      */

      const translateZ =
        -depth *
        smoothPressure;


      /*
      --------------------------------------------------
      IMAGE PARALLAX
      --------------------------------------------------
      */

      const imageX =
        -x *
        parallax *
        smoothPressure;


      const imageY =
        -y *
        parallax *
        smoothPressure;


      /*
      --------------------------------------------------
      APPLY TO IMAGE ONLY
      --------------------------------------------------
      */

      image.style.transform =
        `
        translate3d(
          ${imageX}px,
          ${imageY}px,
          ${translateZ}px
        )
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.06)
        `;


      /*
      --------------------------------------------------
      RESET
      --------------------------------------------------
      */

      if (
        !active.current &&
        Math.abs(x) < 0.001 &&
        Math.abs(y) < 0.001
      ) {

        current.current.x = 0;
        current.current.y = 0;

        image.style.transform =
          `
          translate3d(0,0,0)
          rotateX(0deg)
          rotateY(0deg)
          scale(1.06)
          `;

        stopAnimation(controller);
      }
    },
  };


  /*
  ======================================================
  SETUP
  ======================================================
  */

  useEffect(() => {

    const card =
      cardRef.current;

    if (!card) return;

    updateRect();


    card.addEventListener(
      "pointermove",
      handlePointerMove,
      { passive: true }
    );

    card.addEventListener(
      "pointerdown",
      handlePointerDown,
      { passive: true }
    );

    card.addEventListener(
      "pointerup",
      releasePointer,
      { passive: true }
    );

    card.addEventListener(
      "pointercancel",
      releasePointer,
      { passive: true }
    );

    card.addEventListener(
      "pointerleave",
      handlePointerLeave,
      { passive: true }
    );


    window.addEventListener(
      "resize",
      updateRect,
      { passive: true }
    );


    return () => {

      stopAnimation(controller);

      card.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      card.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      card.removeEventListener(
        "pointerup",
        releasePointer
      );

      card.removeEventListener(
        "pointercancel",
        releasePointer
      );

      card.removeEventListener(
        "pointerleave",
        handlePointerLeave
      );

      window.removeEventListener(
        "resize",
        updateRect
      );
    };

  }, [
    depth,
    rotation,
    parallax,
  ]);


  /*
  ======================================================
  RENDER
  ======================================================
  */

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className="
        bg-white
        rounded-2xl
        overflow-hidden
        shadow-sm
        hover:shadow-md
        transition-shadow
        duration-300
        cursor-pointer
      "
      style={{
        perspective: "900px",
        touchAction: "pan-y",
      }}
    >

      {/* =================================================
          IMAGE
      ================================================= */}

      <div
        className="
          relative
          h-44
          overflow-hidden
        "
        style={{
          perspective: "900px",
        }}
      >

        <div
          ref={imageRef}
          className="
            absolute
            -inset-[6%]
          "
          style={{
            transform:
              "translate3d(0,0,0) rotateX(0deg) rotateY(0deg) scale(1.06)",

            transformOrigin:
              "center center",

            transformStyle:
              "preserve-3d",

            willChange:
              "transform",

            pointerEvents:
              "none",
          }}
        >

          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="
              h-full
              w-full
              object-cover
              select-none
              pointer-events-none
            "
          />

        </div>


        {/* =================================================
            FLOATING ADD BUTTON
        ================================================= */}

        <button
          className="
            theme-primary
            theme-primary-hover
            absolute
            bottom-3
            right-3
            rounded-full
            px-4
            py-1.5
            text-sm
            text-white
            shadow
            z-10
          "
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Add
        </button>

      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="p-4">

        <h3
          className="
            theme-text
            line-clamp-1
            text-lg
            font-semibold
          "
        >
          {item.name}
        </h3>


        <p
          className="
            text-[#5db072]
            text-xs
            mt-1
            line-clamp-2
          "
        >
          {item.description ||
            "Tasty and fresh"}
        </p>


        <div
          className="
            mt-3
            flex
            justify-between
            items-center
          "
        >

          <span
            className="
              font-bold
              text-gray-800
            "
          >
            ₹ {Math.round(
              withGST(item.price)
            )}
          </span>


          <span
            className="
              block
              text-[10px]
              text-gray-400
            "
          >
            {item.options?.length > 0
              ? "onwards · incl. GST"
              : "incl. GST"}
          </span>


          {item.options?.length > 0 && (
            <span
              className="
                text-xs
                text-gray-400
              "
            >
              Customizable
            </span>
          )}

        </div>

      </div>

    </div>
  );
};

export default MenuCard;