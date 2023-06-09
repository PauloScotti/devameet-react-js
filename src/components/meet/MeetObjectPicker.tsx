import { useState } from 'react';
import downIcon from '../../assets/images/arrow_down_object.svg';
import rigthIcon from '../../assets/images/arrow_right_object.svg';
import addIcon from '../../assets/images/plus_circle.svg';

type MeetObjectPickerType = {
    image: string,
    label: string,
    asset: any,
    selected: string,
    setObject(s: string): void,
}

export const MeetObjectPicker: React.FC<MeetObjectPickerType> = ({ image, label, asset, selected, setObject }) => {

    const [show, setShow] = useState(false);

    const getImageFromObject = (object: string) => {
        if (object && object.trim().length > 0) {
            const path = `../../assets/objects/${asset.path}/${object}${asset.camRotate ? '_front' : ''}.png`;
            const imageUrl = new URL(path, import.meta.url);
            return imageUrl.href;
        }
    }

    const selectObject = (o: string) => {
        console.log(o)
        setObject(o);
    }

    return (
        <div className="container-object-picker">
            <div className="action" onClick={() => setShow(!show)}>
                <img src={image} />
                <span>{label}</span>
                {!show
                    ? <img src={downIcon} />
                    : <img src={rigthIcon} />
                }
            </div>
            {show && <div className="objects">
                {asset?.objects?.map((o: any) =>
                    <div className={o === selected ? 'selected' : ''} onClick={() => selectObject(o)}>
                        <img src={getImageFromObject(o)} className={'object ' + (asset.path === 'wall' || asset.path === 'couch' ? 'large' : '')} />
                        <img src={addIcon} className='add' />
                    </div>
                )}
            </div>}
        </div>
    );
}