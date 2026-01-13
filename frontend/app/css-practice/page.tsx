import styles from "./page.module.css";

export default function CssPracticePage() {
  return (
    <div className={styles.wrap}>
      <main className={styles.main}>
        <header>
          <p className={styles.kicker}>CSS practice</p>
          <h1 className={styles.h1}>CSS の練習用ページ</h1>
          <p className={styles.lead}>
            レイアウトやホバー、余白の調整などを試せるように、要素だけ最小限置いています。
          </p>
        </header>

        <section className={styles.section}>
          
          <div className={styles.bubble}>
            プレビューのテキスト
          </div>

          <div className={styles.card}>
            <h2 className={styles.h2}>要素セット</h2>
            <p className={styles.muted}>ここは自由に CSS を当てて遊ぶ用。</p>

            <div className={styles.row}>
              <button type="button" className={styles.buttonPrimary}>
                Primary
              </button>
              <button type="button" className={styles.buttonSecondary}>
                Secondary
              </button>
              <a href="#" className={styles.link}>
                Link
              </a>
            </div>

            <div className={styles.grid}>
              <label className={styles.label}>
                <span className={styles.labelText}>Text input</span>
                <input className={styles.input} placeholder="Type here" />
              </label>

              <label className={styles.label}>
                <span className={styles.labelText}>Select</span>
                <select className={styles.select}>
                  <option>Option A</option>
                  <option>Option B</option>
                  <option>Option C</option>
                </select>
              </label>
            </div>

            <ul className={styles.list}>
              <li className={styles.listItem}>list item 1</li>
              <li className={styles.listItem}>list item 2</li>
              <li className={styles.listItem}>list item 3</li>
            </ul>
          </div>

          <details className={styles.details}>
            <summary className={styles.summary}>メモ（折りたたみ）</summary>
            <p className={styles.muted}>
              例: margin/padding、flex/grid、hover/focus、border/shadow、dark mode。
            </p>
          </details>
        </section>
      </main>
    </div>
  );
}
