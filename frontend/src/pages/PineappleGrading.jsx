import PhotoQualityAI from "../components/PhotoQualityAI";
import "./PineappleGrading.css";

function PineappleGrading() {
    return (
        <div className="grading-page">

            <div className="grading-container">

                <div className="grading-header">
                    <h1>🍍 Pineapple Grading</h1>

                    <p>
                        Upload a pineapple image to analyze
                        its ripeness, size, sweetness and
                        quality grade using AI.
                    </p>
                </div>

                <PhotoQualityAI />

            </div>

        </div>
    );
}

export default PineappleGrading;