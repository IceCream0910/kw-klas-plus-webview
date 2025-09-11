
const TimetableStyles = () => {
  return (
    <style jsx global>{`
      :root {
        --bg-color: #f5e8e8;
        --text-color: #000000;
        --header-bg: #f0f0f0;
        --cell-border: #fff8f7;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --bg-color: #3a3434;
          --text-color: #ffffff;
          --header-bg: #1e1e1e;
          --cell-border: #211e1e;
        }
      }

      body {
        margin: 0;
        padding: 0;
        padding-top: 20px;
        color: var(--text-color);
      }

      .timetable {
        display: grid;
        grid-template-columns: 20px repeat(5, 1fr);
        gap: 1px;
        margin-bottom: 20px;
        background-color: var(--bg-color);
      }

      .timetable > div {
        text-align: left;
        background-color: var(--cell-border);
      }

      .timetable .class {
        position: absolute;
        z-index: 2;
      }

      .header {
        font-weight: bold;
        text-align: center !important;
        height: 30px;
      }

      .time {
        grid-column: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        font-size: 10px;
      }

      .class {
        cursor: pointer;
        font-size: 0.8em;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border-radius: 10px;
        padding: 5px;
        position: absolute;
        width: calc(100% - 10px);
        transition: all 0.3s;
        overflow: hidden;
      }

      .class:active {
        transform: scale(0.95);
      }

      .weekend-classes {
        padding: 15px;
      }

      .weekend-class {
        background-color: var(--bg-color);
        padding: 10px 15px;
        margin-bottom: 10px;
        border-radius: 15px;
        cursor: pointer;
        transition: all 0.3s;
      }

      .weekend-class:active {
        transform: scale(0.98);
      }
    `}</style>
  );
};

export default TimetableStyles;
