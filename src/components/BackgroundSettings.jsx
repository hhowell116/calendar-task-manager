import useLocalStorage from '../hooks/useLocalStorage';

export default function BackgroundSettings({ onClose, setBackgroundImage }) {
    const [previousImages, setPreviousImages] = useLocalStorage('previousBackgrounds', []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newImage = event.target.result;
                setBackgroundImage(newImage);
                if (!previousImages.includes(newImage)) {
                    setPreviousImages([...previousImages, newImage]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Background Settings</h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-800 rounded-full"
                >
                    ✕
                </button>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Upload New</h3>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="background-upload"
                />
                <label
                    htmlFor="background-upload"
                    className="block w-full bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg text-center cursor-pointer mb-4"
                >
                    Select Image
                </label>
            </div>

            {previousImages.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-2">Previous Backgrounds</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {previousImages.map((img, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    setBackgroundImage(img);
                                    onClose();
                                }}
                                className="cursor-pointer h-20 bg-cover bg-center rounded-lg hover:ring-2 hover:ring-blue-500"
                                style={{ backgroundImage: `url(${img})` }}
                                title="Set as background"
                            />
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={() => {
                    setBackgroundImage('');
                    onClose();
                }}
                className="mt-6 w-full bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg"
            >
                Reset to Default
            </button>
        </div>
    );
}