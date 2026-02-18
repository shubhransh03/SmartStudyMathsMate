# change-commits.py

def commit_callback(commit):
    if commit.author_email == b"shubhupadhyay@Shubhs-MacBook-Air.local":
        commit.author_email = b"shubhupadhyay301@gmail.com"
        commit.author_name = b"shubhransh03"
    if commit.committer_email == b"shubhupadhyay@Shubhs-MacBook-Air.local":
        commit.committer_email = b"shubhupadhyay301@gmail.com"
        commit.committer_name = b"shubhransh03"
