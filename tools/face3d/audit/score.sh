#!/bin/zsh
# score.sh [SKINS...] : every fitted skin's head error against its tile, as the site draws it now
# (the shader in src, the files in the harness's public/faces). Each skin is scored by its own
# fit's scorer, in its work folder (WORK/SKIN/fit, set up as each README says): clay pixdiff.py,
# noir noirdiff.py, felt feltdiff.py, the rest tile/tilediff.py. Prints one JSON line per skin.
W=${WORK:-${0:A:h:h}/work}; PORT=${PORT:-58741}
for s in ${@:-clay noir felt claySun stone cel hose pixel riso}; do
  cd $W/$s/fit || continue
  node felt/snapfelt.mjs /tmp/score-$s.png $PORT $s >/dev/null
  case $s in
    clay) r=$(python3 pixdiff.py /tmp/score-$s.png /tmp/score-$s-diff.png) ;;
    noir) r=$(python3 noir/noirdiff.py /tmp/score-$s.png /tmp/score-$s-diff.png) ;;
    felt) r=$(python3 felt/feltdiff.py /tmp/score-$s.png /tmp/score-$s-diff.png) ;;
    *) r=$(python3 tile/tilediff.py $s /tmp/score-$s.png /tmp/score-$s-diff.png) ;;
  esac
  echo "$s $r"
done
