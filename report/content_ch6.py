# -*- coding: utf-8 -*-
"""Chapter 6: Result Analysis."""


def build(b):
    b.start_chapter(6)
    b.h1("6. Result Analysis")

    b.h2("6.1 Introduction")
    b.para("This chapter analyses the results produced by the three machine learning services "
           "described in Chapters 3 and 4: crop recommendation, pest risk prediction, and plant "
           "disease recognition. The crop and pest models were evaluated quantitatively on their "
           "training datasets, while the disease model is described qualitatively because no "
           "independently labeled test set is available in this project.")

    b.h2("6.2 Crop Recommendation Model")
    b.para("The crop model was trained on the 2,200-sample dataset covering twenty-two crops. The "
           "data was split into an 80/20 stratified partition with a fixed random seed, and the "
           "numeric features were standardized with a StandardScaler [32]. A Random Forest with "
           "one hundred trees was selected as the production model and compared with a Gaussian "
           "Naive Bayes classifier and a support vector machine with an RBF kernel on the same "
           "split. Table 6.1 shows the test accuracy of each model.")
    b.add_table(
        ["Model", "Training Samples", "Test Samples", "Test Accuracy"],
        [
            ["Random Forest (production)", "1,760", "440", "99.55%"],
            ["Gaussian Naive Bayes", "1,760", "440", "99.55%"],
            ["Support Vector Machine (RBF)", "1,760", "440", "98.41%"],
        ],
        cap_title="Crop Recommendation Model Comparison",
    )
    b.para("The Random Forest achieved 99.55% accuracy on the held-out test set, matching the "
           "near-perfect results reported in the literature for Random Forest and K-nearest "
           "neighbour classifiers on standard crop datasets [16], [17]. Its weighted precision, "
           "recall, and F1-score are all approximately 1.00; the only misclassification among the "
           "twenty-two crops was blackgram, whose recall reached 0.95. The model is therefore "
           "suitable for recommendation within the covered soil and climate range.")

    b.h2("6.3 Pest Risk Prediction Model")
    b.para("The pest risk model is a Gaussian Naive Bayes pipeline that scales the four numeric "
           "features and one-hot encodes the two categorical features [32]. The available dataset "
           "contains only seventeen records, distributed across three risk levels (eight Low, five "
           "High, and four Medium), which is too small for a reliable hold-out evaluation. The "
           "model was therefore assessed with three-fold cross-validation, with the results in "
           "Table 6.2.")
    b.add_table(
        ["Evaluation", "Result"],
        [
            ["Mean 3-fold cross-validation accuracy", "75.56%"],
            ["Standard deviation across folds", "17.50%"],
            ["Single 80/20 hold-out accuracy (4 test samples)", "50.00%"],
            ["Training / test samples in the single split", "13 / 4"],
        ],
        cap_title="Pest Risk Model Results",
    )
    b.para("Because of the very small training set, the pest results are indicative only and do "
           "not generalize to regions outside the training distribution, as noted in the "
           "limitations in Chapter 7.")

    b.h2("6.4 Plant Disease Recognition Model")
    b.para("The disease recognition model is a fine-tuned EfficientNetB4 convolutional neural "
           "network with a softmax head over thirty-nine classes and 160x160 pixel inputs [21], "
           "[28]. The service reports the top three classes with their probabilities and applies a "
           "0.5 confidence threshold below which the image is labelled Unrecognized [41]. The model "
           "was validated during the transfer-learning training stage, where it converged on the "
           "training distribution; no independent labeled test set is kept in the repository, so a "
           "quantitative generalization figure is not claimed. Representative inference results "
           "appear in the system screenshots in Appendix A.")

    b.h2("6.5 Summary of Results")
    b.para("The crop recommendation models performed at near-perfect accuracy on the 22-crop "
           "dataset, with the Random Forest selected for production. The pest model is indicative "
           "only because of its seventeen-record dataset, and the disease model is reported "
           "qualitatively pending a labeled test set. All three services were exercised end to end "
           "through their proxy routes and met the response-time requirement of Chapter 3 (Table "
           "5.6). The next chapter concludes the report and outlines directions for future work.")
