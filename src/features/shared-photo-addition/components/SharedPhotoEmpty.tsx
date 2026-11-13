import { css } from 'styled-system/css'

export function SharedPhotoEmpty() {
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
      <h1 className={css({ fontSize: '2xl', fontWeight: 'bold' })}>共有された写真</h1>
      <p className={css({ color: 'muted' })}>
        共有された写真はありません．Google フォトなどの共有メニューから Field Note を選ぶと，写真を記録に追加できます．共有した直後にこの画面が表示された場合は，写真を受け取れなかったため，もう一度共有してください．
      </p>
    </div>
  )
}
