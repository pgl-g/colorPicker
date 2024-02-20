
import ColorPicker from './ColorPicker';
import "@/assets/index.less"


export default function HomePage() {
  return (
    <div>
      取色器： <ColorPicker onChange={(color, type) => {
        console.log(color, type, '颜色')
      }}
        onChangeComplete={(val) => {
          // console.log(val.toHex(), 'sss')
        }}
      />
    </div>
  );
}
