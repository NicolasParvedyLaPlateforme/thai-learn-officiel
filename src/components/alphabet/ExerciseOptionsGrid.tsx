import { AlphabetItem } from "@/types";
import { AlphabetExerciseOption } from "./AlphabetExerciseOption";

interface ExerciseOptionsGridProps {
    options: AlphabetItem[];
    selectedOption: AlphabetItem | null;
    isCorrectState: boolean | null;
    language: string;
    onOptionSelect: (opt: AlphabetItem) => void;
}

export const ExerciseOptionsGrid = ({
    options,
    selectedOption,
    isCorrectState,
    language,
    onOptionSelect,
}: ExerciseOptionsGridProps) => {
    return (
        <div className={`w-full grid gap-3 md:gap-4 ${options.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
            {options.map((opt, i) => (
                <AlphabetExerciseOption
                    key={i}
                    opt={opt}
                    isSelected={selectedOption?.letter === opt.letter}
                    isCorrectState={isCorrectState}
                    language={language}
                    onClick={() => {
                        // Permet d'éviter de redéclencher un choix si la réponse a déjà été validée
                        if (isCorrectState === null) {
                            onOptionSelect(opt);
                        }
                    }}
                />
            ))}
        </div>
    );
};