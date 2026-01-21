# Specs

i want to create an annotation app. it has two rows in its UI: two parallel colums in the first row that take up 70% of the screen, like a git diff kind of UI, one version one side, second on the other.
however, these columns will show input to an LLM in one column and output in the second.
there should be an option on the top right to turn on "diff" mode, in which case the differences will be highlighted in green +, red -, just like git diffs (what a fantastic, timeless UI)
the bottom 30% should be one row, where the annotator can add their comments.

don't even think about authentication or DB storage for now. it will point to a filepath, with a csv that has an `input` and `output` column. these things will be configurable later but let's just go with hardcoding for now. there is only one user for now. auth will come later.
